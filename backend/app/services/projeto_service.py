from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.colecao import Colecao
from app.models.defeito import Defeito
from app.models.projeto import Projeto
from app.schemas.common import StatusDefeito
from app.schemas.projeto import (
    MetricasProjeto,
    ProjetoCreate,
    ProjetoUpdate,
    ResumoProjetos,
)

ABERTOS = ("aberto", "em_analise", "em_correcao", "pronto_reteste", "reaberto")
CRITICOS = ("critica", "alta")


async def listar(db: AsyncSession, status_filtro: str | None = None) -> list[Projeto]:
    stmt = select(Projeto).order_by(Projeto.created_at.desc())
    if status_filtro:
        stmt = stmt.where(Projeto.status == status_filtro)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def obter(db: AsyncSession, projeto_id: str) -> Projeto:
    projeto = await db.get(Projeto, projeto_id)
    if projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return projeto


async def criar(db: AsyncSession, data: ProjetoCreate, criado_por: str) -> Projeto:
    existente = await db.execute(select(Projeto).where(Projeto.chave == data.chave))
    if existente.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Já existe um projeto com a chave {data.chave}.",
        )
    projeto = Projeto(
        chave=data.chave,
        nome=data.nome,
        descricao=data.descricao,
        repo_owner=data.repo_owner,
        repo_name=data.repo_name,
        responsavel=data.responsavel or criado_por,
        status=data.status.value,
        criado_por=criado_por,
    )
    db.add(projeto)
    await db.commit()
    return await obter(db, projeto.id)


async def atualizar(db: AsyncSession, projeto_id: str, data: ProjetoUpdate) -> Projeto:
    projeto = await obter(db, projeto_id)
    campos = data.model_dump(exclude_unset=True)
    if "status" in campos and campos["status"] is not None:
        campos["status"] = data.status.value if data.status else projeto.status
    for campo, valor in campos.items():
        if valor is not None:
            setattr(projeto, campo, valor)
    await db.commit()
    return await obter(db, projeto_id)


async def remover(db: AsyncSession, projeto_id: str) -> None:
    """Remove o projeto. Defeitos e coleções são preservados e ficam sem projeto."""
    projeto = await obter(db, projeto_id)
    for modelo in (Defeito, Colecao):
        result = await db.execute(select(modelo).where(modelo.projeto_id == projeto_id))
        for item in result.scalars().all():
            item.projeto_id = None
    await db.delete(projeto)
    await db.commit()


async def metricas(db: AsyncSession, projeto_id: str | None = None) -> MetricasProjeto:
    """Agrega defeitos e coleções. Sem `projeto_id`, considera a base inteira."""

    def escopo(stmt, modelo):
        return stmt.where(modelo.projeto_id == projeto_id) if projeto_id else stmt

    sev = await db.execute(
        escopo(select(Defeito.severidade, func.count()).group_by(Defeito.severidade), Defeito)
    )
    por_severidade = {s: n for s, n in sev.all()}

    st = await db.execute(
        escopo(select(Defeito.status, func.count()).group_by(Defeito.status), Defeito)
    )
    por_status = {s: n for s, n in st.all()}

    ultimo = await db.execute(escopo(select(func.max(Defeito.created_at)), Defeito))
    ultimo_em: datetime | None = ultimo.scalar_one_or_none()

    cols = await db.execute(
        escopo(select(func.count(), func.coalesce(func.sum(Colecao.total_requests), 0)), Colecao)
    )
    colecoes_total, requests_total = cols.one()

    return MetricasProjeto(
        defeitos_total=sum(por_status.values()),
        defeitos_abertos=sum(n for s, n in por_status.items() if s in ABERTOS),
        defeitos_criticos=sum(n for s, n in por_severidade.items() if s in CRITICOS),
        defeitos_resolvidos=por_status.get(StatusDefeito.resolvido.value, 0),
        colecoes_total=colecoes_total or 0,
        requests_total=requests_total or 0,
        por_severidade=por_severidade,
        por_status=por_status,
        ultimo_defeito_em=ultimo_em,
    )


async def listar_com_metricas(db: AsyncSession, status_filtro: str | None = None) -> list[dict]:
    projetos = await listar(db, status_filtro)
    saida = []
    for p in projetos:
        saida.append(
            {
                "id": p.id,
                "chave": p.chave,
                "nome": p.nome,
                "descricao": p.descricao,
                "status": p.status,
                "responsavel": p.responsavel,
                "criado_por": p.criado_por,
                "repo": p.repo,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
                "metricas": await metricas(db, p.id),
            }
        )
    return saida


async def resumo(db: AsyncSession, projeto_id: str | None = None) -> ResumoProjetos:
    total = await db.execute(select(func.count()).select_from(Projeto))
    ativos = await db.execute(
        select(func.count()).select_from(Projeto).where(Projeto.status == "ativo")
    )
    orfaos = await db.execute(
        select(func.count()).select_from(Defeito).where(Defeito.projeto_id.is_(None))
    )
    return ResumoProjetos(
        projetos_total=total.scalar_one(),
        projetos_ativos=ativos.scalar_one(),
        metricas=await metricas(db, projeto_id),
        sem_projeto=orfaos.scalar_one(),
    )
