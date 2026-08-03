from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import StatusProjeto
from app.schemas.projeto import (
    ProjetoComMetricas,
    ProjetoCreate,
    ProjetoOut,
    ProjetoUpdate,
    ResumoProjetos,
)
from app.services import projeto_service

router = APIRouter(prefix="/projetos", tags=["projetos"])


@router.get("", response_model=list[ProjetoComMetricas])
async def listar(
    db: DbSession,
    _user: CurrentUser,
    status_filtro: StatusProjeto | None = Query(default=None, alias="status"),
) -> list:
    return await projeto_service.listar_com_metricas(
        db, status_filtro.value if status_filtro else None
    )


@router.get("/resumo", response_model=ResumoProjetos)
async def resumo(
    db: DbSession,
    _user: CurrentUser,
    projeto_id: str | None = Query(default=None, alias="projetoId"),
) -> object:
    return await projeto_service.resumo(db, projeto_id)


@router.post("", response_model=ProjetoOut, status_code=status.HTTP_201_CREATED)
async def criar(data: ProjetoCreate, db: DbSession, user: CurrentUser) -> object:
    return await projeto_service.criar(db, data, criado_por=user.name)


@router.get("/{projeto_id}", response_model=ProjetoOut)
async def obter(projeto_id: str, db: DbSession, _user: CurrentUser) -> object:
    return await projeto_service.obter(db, projeto_id)


@router.patch("/{projeto_id}", response_model=ProjetoOut)
async def atualizar(
    projeto_id: str, data: ProjetoUpdate, db: DbSession, _user: CurrentUser
) -> object:
    return await projeto_service.atualizar(db, projeto_id, data)


@router.delete("/{projeto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(projeto_id: str, db: DbSession, _user: CurrentUser) -> None:
    await projeto_service.remover(db, projeto_id)
