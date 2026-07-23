from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.models.teste import CasoDeTeste, Execucao
from app.schemas.teste import CasoDeTesteOut, ExecucaoOut

router = APIRouter(tags=["testes"])


@router.get("/casos-de-teste", response_model=list[CasoDeTesteOut])
async def listar_casos(db: DbSession, _user: CurrentUser) -> list[CasoDeTeste]:
    result = await db.execute(select(CasoDeTeste).order_by(CasoDeTeste.id))
    return list(result.scalars().all())


@router.get("/execucoes", response_model=list[ExecucaoOut])
async def listar_execucoes(db: DbSession, _user: CurrentUser) -> list[Execucao]:
    result = await db.execute(select(Execucao).order_by(Execucao.id.desc()))
    return list(result.scalars().all())
