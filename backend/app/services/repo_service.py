"""Ingestão de repositórios: baixa o tarball do GitHub, extrai no storage local
e permite ao agente explorar a árvore, ler arquivos e buscar no código inteiro.

Usa o tarball (`/repos/{owner}/{repo}/tarball`) em vez de `git clone` para não
exigir o binário `git` dentro do container — só a stdlib (tarfile) + httpx.
"""

import io
import shutil
import tarfile
from pathlib import Path

import httpx

from app.core.config import settings
from app.services.github_service import API, GitHubError, _headers

# Pastas ignoradas na análise (dependências, builds, VCS).
_IGNORAR_DIRS = {
    ".git", "node_modules", "dist", "build", ".next", ".nuxt", ".venv", "venv",
    "__pycache__", ".turbo", "coverage", "vendor", ".idea", ".vscode", "target",
}
# Extensões binárias/pesadas que não vale a pena ler como texto.
_BIN_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".svg", ".bmp", ".pdf",
    ".zip", ".gz", ".tar", ".rar", ".7z", ".mp4", ".mov", ".avi", ".mp3", ".wav",
    ".woff", ".woff2", ".ttf", ".eot", ".otf", ".lockb", ".jar", ".class", ".exe",
    ".dll", ".so", ".dylib", ".bin", ".wasm", ".map",
}
_MAX_FILE_BYTES = 200_000          # ignora arquivos-texto acima disso na árvore/busca
_MAX_TARBALL_BYTES = 60 * 1024 * 1024  # 60 MB — recusa repos grandes demais
# Arquivos que descrevem o projeto — sempre incluídos no resumo de análise.
_ARQUIVOS_CHAVE = [
    "README.md", "readme.md", "README", "package.json", "pyproject.toml",
    "requirements.txt", "docker-compose.yml", "Dockerfile", "vite.config.ts",
    "vite.config.js", "tsconfig.json", "next.config.js", "index.html",
]


def _base_dir() -> Path:
    d = Path(settings.STORAGE_DIR) / "repos"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _repo_dir(owner: str, repo: str) -> Path:
    return _base_dir() / f"{owner}__{repo}"


def _esta_sincronizado(dest: Path) -> bool:
    return dest.exists() and any(dest.iterdir())


def _iter_arquivos(dest: Path):
    for p in dest.rglob("*"):
        if p.is_dir():
            continue
        if set(p.relative_to(dest).parts) & _IGNORAR_DIRS:
            continue
        yield p


def _arquivos_texto(dest: Path) -> list[Path]:
    out: list[Path] = []
    for p in _iter_arquivos(dest):
        if p.suffix.lower() in _BIN_EXT:
            continue
        try:
            if p.stat().st_size > _MAX_FILE_BYTES:
                continue
        except OSError:
            continue
        out.append(p)
    return out


def _rel(dest: Path, p: Path) -> str:
    return str(p.relative_to(dest)).replace("\\", "/")


async def sincronizar(owner: str, repo: str, ref: str | None = None, forcar: bool = False) -> dict:
    """Baixa o repositório (tarball) e extrai no cache local. Idempotente: reusa o
    cache se já existir, a menos que `forcar=True`."""
    dest = _repo_dir(owner, repo)
    if _esta_sincronizado(dest) and not forcar:
        return {"owner": owner, "repo": repo, "sincronizado": True, "cache": True}

    url = f"{API}/repos/{owner}/{repo}/tarball" + (f"/{ref}" if ref else "")
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=60) as client:
            r = await client.get(url, headers=_headers())
    except httpx.HTTPError as e:
        raise GitHubError(f"Falha ao baixar o repositório: {e}") from e

    if r.status_code == 404:
        raise GitHubError("Repositório não encontrado no GitHub (ou é privado sem token).")
    if r.status_code == 403 and "rate limit" in r.text.lower():
        raise GitHubError("Limite da API do GitHub atingido. Tente mais tarde ou configure um GITHUB_TOKEN.")
    if r.status_code >= 400:
        raise GitHubError(f"GitHub retornou {r.status_code} ao baixar o repositório.")
    if len(r.content) > _MAX_TARBALL_BYTES:
        raise GitHubError("Repositório grande demais para análise automática (acima de 60 MB).")

    if dest.exists():
        shutil.rmtree(dest, ignore_errors=True)
    dest.mkdir(parents=True, exist_ok=True)

    try:
        with tarfile.open(fileobj=io.BytesIO(r.content), mode="r:gz") as tar:
            membros = tar.getmembers()
            raiz = membros[0].name.split("/")[0] if membros else ""
            tar.extractall(dest, filter="data")  # filter="data" evita path traversal
    except (tarfile.TarError, OSError) as e:
        raise GitHubError(f"Falha ao extrair o repositório: {e}") from e

    # O tarball vem dentro de uma pasta raiz (owner-repo-sha/). Achata para dest/.
    inner = dest / raiz
    if raiz and inner.is_dir():
        for item in inner.iterdir():
            shutil.move(str(item), str(dest / item.name))
        shutil.rmtree(inner, ignore_errors=True)

    total = sum(1 for _ in _iter_arquivos(dest))
    return {"owner": owner, "repo": repo, "sincronizado": True, "cache": False, "total_arquivos": total}


def arvore(owner: str, repo: str, limite: int = 400) -> object:
    dest = _repo_dir(owner, repo)
    if not _esta_sincronizado(dest):
        return {"erro": "Repositório ainda não foi baixado. Use analisar_codigo primeiro."}
    paths = sorted(_rel(dest, p) for p in _iter_arquivos(dest))
    return {"total": len(paths), "arquivos": paths[:limite], "truncado": len(paths) > limite}


async def analisar(owner: str, repo: str) -> dict:
    """Baixa (fresco) o repositório e devolve estrutura + conteúdo dos arquivos-chave."""
    resumo = await sincronizar(owner, repo, forcar=True)
    dest = _repo_dir(owner, repo)
    chaves: dict[str, str] = {}
    for nome in _ARQUIVOS_CHAVE:
        p = dest / nome
        if p.is_file():
            try:
                chaves[nome] = p.read_text(encoding="utf-8", errors="replace")[:4000]
            except OSError:
                continue
    return {"resumo": resumo, "estrutura": arvore(owner, repo, limite=300), "arquivos_chave": chaves}


async def ler_arquivo(owner: str, repo: str, caminho: str, max_chars: int = 8000) -> dict:
    dest = _repo_dir(owner, repo)
    if not _esta_sincronizado(dest):
        await sincronizar(owner, repo)
    alvo = (dest / caminho).resolve()
    if not str(alvo).startswith(str(dest.resolve())):
        return {"erro": "Caminho inválido."}
    if not alvo.is_file():
        return {"erro": f"Arquivo '{caminho}' não encontrado no repositório."}
    if alvo.suffix.lower() in _BIN_EXT:
        return {"erro": f"'{caminho}' é um arquivo binário — não dá para ler como texto."}
    try:
        texto = alvo.read_text(encoding="utf-8", errors="replace")
    except OSError as e:
        return {"erro": str(e)}
    return {"caminho": caminho, "conteudo": texto[:max_chars], "truncado": len(texto) > max_chars}


async def buscar(owner: str, repo: str, termo: str, max_hits: int = 40) -> object:
    dest = _repo_dir(owner, repo)
    if not _esta_sincronizado(dest):
        await sincronizar(owner, repo)
    termo_low = termo.lower()
    hits: list[dict] = []
    for p in _arquivos_texto(dest):
        try:
            linhas = p.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for i, linha in enumerate(linhas, 1):
            if termo_low in linha.lower():
                hits.append({"arquivo": _rel(dest, p), "linha": i, "trecho": linha.strip()[:200]})
                if len(hits) >= max_hits:
                    return {"termo": termo, "ocorrencias": hits, "truncado": True}
    return {"termo": termo, "ocorrencias": hits, "truncado": False}
