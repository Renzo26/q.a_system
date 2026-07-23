from fastapi import APIRouter, File, Query, UploadFile, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import StatusDefeito
from app.schemas.defeito import DefeitoCreate, DefeitoOut, StatusUpdate
from app.services import defeito_service

router = APIRouter(prefix="/defeitos", tags=["defeitos"])


@router.get("", response_model=list[DefeitoOut])
async def listar(
    db: DbSession,
    _user: CurrentUser,
    status_filtro: StatusDefeito | None = Query(default=None, alias="status"),
) -> list:
    return await defeito_service.listar(db, status_filtro.value if status_filtro else None)


@router.post("", response_model=DefeitoOut, status_code=status.HTTP_201_CREATED)
async def criar(data: DefeitoCreate, db: DbSession, user: CurrentUser) -> object:
    return await defeito_service.criar(db, data, criado_por=user.name)


@router.get("/{defeito_id}", response_model=DefeitoOut)
async def obter(defeito_id: str, db: DbSession, _user: CurrentUser) -> object:
    return await defeito_service.obter(db, defeito_id)


@router.patch("/{defeito_id}/status", response_model=DefeitoOut)
async def atualizar_status(
    defeito_id: str, data: StatusUpdate, db: DbSession, _user: CurrentUser
) -> object:
    return await defeito_service.atualizar_status(db, defeito_id, data.status)


@router.delete("/{defeito_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(defeito_id: str, db: DbSession, _user: CurrentUser) -> None:
    await defeito_service.remover(db, defeito_id)


@router.post("/{defeito_id}/evidencias", response_model=DefeitoOut)
async def anexar_evidencias(
    defeito_id: str,
    db: DbSession,
    _user: CurrentUser,
    files: list[UploadFile] = File(...),
) -> object:
    return await defeito_service.anexar_evidencias(db, defeito_id, files)
