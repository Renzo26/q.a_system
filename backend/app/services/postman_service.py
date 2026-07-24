import re
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.colecao import Colecao

# pm.test("nome do teste", ...) / pm.test('...') / pm.test(`...`)
_PM_TEST_RE = re.compile(r"""pm\.test\(\s*(['"`])(.+?)\1""", re.DOTALL)
# tests['nome'] = ... (sintaxe antiga do Postman)
_TESTS_OLD_RE = re.compile(r"""tests\[\s*(['"`])(.+?)\1\s*\]""")


def _desc_to_str(desc: Any) -> str:
    if isinstance(desc, dict):
        return str(desc.get("content", ""))
    return str(desc or "")


def _url_to_str(url: Any) -> str:
    if isinstance(url, str):
        return url
    if isinstance(url, dict):
        raw = url.get("raw")
        if raw:
            return str(raw)
        host = url.get("host")
        path = url.get("path")
        h = ".".join(host) if isinstance(host, list) else (host or "")
        p = "/".join(str(x) for x in path) if isinstance(path, list) else (path or "")
        return f"{h}/{p}".strip("/")
    return ""


def _extract_checks(item: dict) -> list[str]:
    """Extrai os nomes dos testes (pm.test) — já costumam ser frases legíveis."""
    checks: list[str] = []
    for ev in item.get("event", []) or []:
        if ev.get("listen") != "test":
            continue
        script = ev.get("script", {}) or {}
        exec_ = script.get("exec", [])
        texto = "\n".join(exec_) if isinstance(exec_, list) else str(exec_)
        for m in _PM_TEST_RE.finditer(texto):
            checks.append(m.group(2).strip())
        for m in _TESTS_OLD_RE.finditer(texto):
            checks.append(m.group(2).strip())
    # remove duplicados preservando a ordem
    vistos: set[str] = set()
    unicos: list[str] = []
    for c in checks:
        if c and c not in vistos:
            vistos.add(c)
            unicos.append(c)
    return unicos


def _body_resumo(request: dict) -> str | None:
    body = request.get("body") or {}
    mode = body.get("mode")
    if mode == "raw":
        raw = (body.get("raw") or "").strip()
        return raw[:500] if raw else None
    if mode == "formdata":
        keys = [f.get("key") for f in body.get("formdata", []) or []]
        campos = ", ".join(k for k in keys if k)
        return f"form-data: {campos}" if campos else None
    if mode == "urlencoded":
        keys = [f.get("key") for f in body.get("urlencoded", []) or []]
        campos = ", ".join(k for k in keys if k)
        return f"urlencoded: {campos}" if campos else None
    return None


def is_colecao_valida(raw: Any) -> bool:
    return isinstance(raw, dict) and "item" in raw and isinstance(raw.get("item"), list)


def parse_collection(raw: dict) -> dict:
    """Converte uma coleção Postman v2.1 em um fluxo legível (passos ordenados)."""
    info = raw.get("info", {}) or {}
    nome = info.get("name") or "Coleção sem nome"
    descricao = _desc_to_str(info.get("description"))

    passos: list[dict] = []
    pastas: set[str] = set()
    contador = {"n": 0}

    def walk(items: list, pasta: str) -> None:
        for it in items or []:
            if not isinstance(it, dict):
                continue
            if isinstance(it.get("item"), list):  # é uma pasta
                nome_pasta = it.get("name", "")
                if nome_pasta:
                    pastas.add(nome_pasta)
                sub = nome_pasta if not pasta else f"{pasta} / {nome_pasta}"
                walk(it["item"], sub)
            elif "request" in it:  # é uma requisição
                req = it.get("request") or {}
                if isinstance(req, str):
                    req = {"method": "GET", "url": req}
                contador["n"] += 1
                descricao_req = _desc_to_str(req.get("description")) or _desc_to_str(it.get("description"))
                passos.append(
                    {
                        "ordem": contador["n"],
                        "pasta": pasta,
                        "nome": it.get("name") or "Requisição",
                        "metodo": (req.get("method") or "GET").upper(),
                        "url": _url_to_str(req.get("url")),
                        "descricao": descricao_req,
                        "checks": _extract_checks(it),
                        "body_resumo": _body_resumo(req),
                    }
                )

    walk(raw.get("item"), "")

    variaveis = [
        {"chave": v.get("key", ""), "valor": str(v.get("value", ""))}
        for v in (raw.get("variable") or [])
        if v.get("key")
    ]

    return {
        "nome": nome,
        "descricao": descricao,
        "total_requests": len(passos),
        "total_pastas": len(pastas),
        "variaveis": variaveis,
        "passos": passos,
    }


# ---------- Operações de persistência ----------

async def importar(db: AsyncSession, raw: dict, criado_por: str) -> Colecao:
    if not is_colecao_valida(raw):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo inválido: não parece uma coleção do Postman (v2.1). Exporte como 'Collection v2.1'.",
        )
    parsed = parse_collection(raw)
    colecao = Colecao(
        nome=parsed["nome"],
        descricao=parsed["descricao"],
        total_requests=parsed["total_requests"],
        total_pastas=parsed["total_pastas"],
        criado_por=criado_por,
        raw=raw,
    )
    db.add(colecao)
    await db.commit()
    await db.refresh(colecao)
    return colecao


async def listar(db: AsyncSession) -> list[Colecao]:
    result = await db.execute(select(Colecao).order_by(Colecao.created_at.desc()))
    return list(result.scalars().all())


async def obter(db: AsyncSession, colecao_id: str) -> Colecao:
    colecao = await db.get(Colecao, colecao_id)
    if colecao is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coleção não encontrada")
    return colecao


async def obter_detalhe(db: AsyncSession, colecao_id: str) -> dict:
    colecao = await obter(db, colecao_id)
    parsed = parse_collection(colecao.raw)
    return {"id": colecao.id, **parsed}


async def remover(db: AsyncSession, colecao_id: str) -> None:
    colecao = await obter(db, colecao_id)
    await db.delete(colecao)
    await db.commit()
