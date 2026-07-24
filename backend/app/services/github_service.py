import httpx

from app.core.config import settings

API = "https://api.github.com"


class GitHubError(Exception):
    """Erro amigável ao consultar a API do GitHub."""


def _headers() -> dict:
    h = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if settings.GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return h


async def _get(
    client: httpx.AsyncClient,
    path: str,
    params: dict | None = None,
    accept: str | None = None,
) -> httpx.Response:
    headers = _headers()
    if accept:
        headers["Accept"] = accept
    try:
        return await client.get(f"{API}{path}", params=params, headers=headers, timeout=15)
    except httpx.HTTPError as e:
        raise GitHubError(f"Falha de rede ao acessar o GitHub: {e}") from e


def _check(r: httpx.Response) -> None:
    if r.status_code == 404:
        raise GitHubError("Repositório não encontrado no GitHub (ou é privado sem token).")
    if r.status_code == 403 and "rate limit" in r.text.lower():
        raise GitHubError(
            "Limite da API pública do GitHub atingido. Tente mais tarde ou configure um GITHUB_TOKEN."
        )
    if r.status_code >= 400:
        raise GitHubError(f"GitHub retornou {r.status_code}.")


async def info_repo(owner: str, repo: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}")
        _check(r)
        d = r.json()
        rl = await _get(client, f"/repos/{owner}/{repo}/languages")
        if rl.status_code == 200:
            linguagens = list(rl.json().keys())[:5]
        else:
            linguagens = [d["language"]] if d.get("language") else []
        return {
            "owner": owner,
            "repo": repo,
            "descricao": d.get("description") or "",
            "default_branch": d.get("default_branch") or "main",
            "linguagens": linguagens,
            "stars": d.get("stargazers_count", 0),
            "visibilidade": "Privado" if d.get("private") else "Público",
            "url": d.get("html_url") or f"https://github.com/{owner}/{repo}",
            "atualizado_em": d.get("pushed_at"),
            "issues_abertas": d.get("open_issues_count", 0),
        }


async def listar_commits(owner: str, repo: str, branch: str | None = None, limite: int = 10) -> list[dict]:
    limite = max(1, min(limite, 30))
    params: dict = {"per_page": limite}
    if branch:
        params["sha"] = branch
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}/commits", params=params)
        _check(r)
        return [
            {
                "sha": c.get("sha", "")[:7],
                "mensagem": (c.get("commit", {}).get("message") or "").split("\n")[0],
                "autor": c.get("commit", {}).get("author", {}).get("name"),
                "data": c.get("commit", {}).get("author", {}).get("date"),
            }
            for c in r.json()
        ]


async def detalhar_commit(owner: str, repo: str, sha: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}/commits/{sha}")
        _check(r)
        d = r.json()
        commit = d.get("commit", {})
        stats = d.get("stats", {})
        arquivos = [
            {
                "arquivo": f.get("filename"),
                "status": f.get("status"),
                "adicionadas": f.get("additions", 0),
                "removidas": f.get("deletions", 0),
            }
            for f in (d.get("files") or [])[:30]
        ]
        return {
            "sha": d.get("sha", "")[:7],
            "mensagem": commit.get("message"),
            "autor": commit.get("author", {}).get("name"),
            "data": commit.get("author", {}).get("date"),
            "linhas_adicionadas": stats.get("additions", 0),
            "linhas_removidas": stats.get("deletions", 0),
            "arquivos_alterados": len(d.get("files") or []),
            "arquivos": arquivos,
        }


async def obter_readme(owner: str, repo: str, max_chars: int = 6000) -> dict:
    """Lê o README do repositório (texto cru). Melhor fonte para entender o propósito do projeto."""
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}/readme", accept="application/vnd.github.raw")
        if r.status_code == 404:
            return {"tem_readme": False, "conteudo": "", "aviso": "Este repositório não tem README."}
        _check(r)
        texto = r.text
        return {
            "tem_readme": True,
            "conteudo": texto[:max_chars],
            "truncado": len(texto) > max_chars,
        }


async def listar_arquivos(owner: str, repo: str, caminho: str = "") -> object:
    """Lista arquivos/pastas de um caminho do repositório (vazio = raiz)."""
    caminho = (caminho or "").strip("/")
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}/contents/{caminho}")
        _check(r)
        data = r.json()
        if isinstance(data, dict):  # apontou para um arquivo, não uma pasta
            return [{"nome": data.get("name"), "tipo": data.get("type"), "tamanho": data.get("size")}]
        return [
            {
                "nome": item.get("name"),
                "tipo": item.get("type"),  # "file" ou "dir"
                "caminho": item.get("path"),
                "tamanho": item.get("size"),
            }
            for item in data
        ][:100]


async def ler_arquivo(owner: str, repo: str, caminho: str, max_chars: int = 6000) -> dict:
    """Lê o conteúdo cru de um arquivo do repositório."""
    caminho = (caminho or "").strip("/")
    async with httpx.AsyncClient() as client:
        r = await _get(client, f"/repos/{owner}/{repo}/contents/{caminho}", accept="application/vnd.github.raw")
        if r.status_code == 404:
            raise GitHubError(f"Arquivo '{caminho}' não encontrado no repositório.")
        _check(r)
        texto = r.text
        return {
            "caminho": caminho,
            "conteudo": texto[:max_chars],
            "truncado": len(texto) > max_chars,
        }


async def listar_pull_requests(owner: str, repo: str, state: str = "open", limite: int = 10) -> list[dict]:
    limite = max(1, min(limite, 30))
    async with httpx.AsyncClient() as client:
        r = await _get(
            client,
            f"/repos/{owner}/{repo}/pulls",
            params={"state": state, "per_page": limite},
        )
        _check(r)
        return [
            {
                "numero": p.get("number"),
                "titulo": p.get("title"),
                "autor": p.get("user", {}).get("login"),
                "estado": p.get("state"),
                "origem": p.get("head", {}).get("ref"),
                "destino": p.get("base", {}).get("ref"),
                "criado_em": p.get("created_at"),
            }
            for p in r.json()
        ]
