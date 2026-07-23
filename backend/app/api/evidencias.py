from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse

from app.core.deps import DbSession
from app.models.defeito import Evidencia

router = APIRouter(prefix="/evidencias", tags=["evidencias"])


@router.get("/{evidencia_id}/conteudo")
async def conteudo(evidencia_id: str, db: DbSession) -> FileResponse:
    """Serve o arquivo bruto da evidência (público no dev para uso em <img>/<video>)."""
    evidencia = await db.get(Evidencia, evidencia_id)
    if evidencia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidência não encontrada")
    caminho = Path(evidencia.storage_path)
    if not caminho.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arquivo ausente no storage")
    return FileResponse(path=caminho, media_type=evidencia.mime, filename=evidencia.nome)
