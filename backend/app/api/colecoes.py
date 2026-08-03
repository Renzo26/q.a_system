import json

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.colecao import ColecaoDetalheOut, ColecaoOut
from app.services import postman_service

router = APIRouter(prefix="/colecoes", tags=["colecoes"])


@router.get("", response_model=list[ColecaoOut])
async def listar(
    db: DbSession,
    _user: CurrentUser,
    projeto_id: str | None = Query(default=None, alias="projetoId"),
) -> list:
    return await postman_service.listar(db, projeto_id)


@router.post("", response_model=ColecaoOut, status_code=status.HTTP_201_CREATED)
async def importar(
    db: DbSession,
    user: CurrentUser,
    file: UploadFile = File(...),
    projeto_id: str | None = Query(default=None, alias="projetoId"),
) -> object:
    conteudo = await file.read()
    try:
        raw = json.loads(conteudo.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo não é um JSON válido.",
        )
    return await postman_service.importar(db, raw, criado_por=user.name, projeto_id=projeto_id)


@router.get("/{colecao_id}", response_model=ColecaoDetalheOut)
async def detalhe(colecao_id: str, db: DbSession, _user: CurrentUser) -> dict:
    return await postman_service.obter_detalhe(db, colecao_id)


@router.delete("/{colecao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover(colecao_id: str, db: DbSession, _user: CurrentUser) -> None:
    await postman_service.remover(db, colecao_id)
