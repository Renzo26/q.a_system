from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.models.defeito import Evidencia


def _tipo_from_mime(mime: str) -> str:
    if mime.startswith("image/"):
        return "imagem"
    if mime.startswith("video/"):
        return "video"
    if mime.startswith("text/") or mime in {"application/json", "application/xml"}:
        return "log"
    return "arquivo"


async def salvar_upload(defeito_id: str, arquivo: UploadFile) -> Evidencia:
    """Persiste o arquivo no storage (disco local no dev; Supabase Storage em produção)
    e devolve a entidade Evidencia (ainda não commitada)."""
    conteudo = await arquivo.read()
    dest_dir = Path(settings.STORAGE_DIR) / defeito_id
    dest_dir.mkdir(parents=True, exist_ok=True)

    sufixo = Path(arquivo.filename or "").suffix
    storage_path = dest_dir / f"{uuid4().hex}{sufixo}"
    storage_path.write_bytes(conteudo)

    mime = arquivo.content_type or "application/octet-stream"
    return Evidencia(
        defeito_id=defeito_id,
        tipo=_tipo_from_mime(mime),
        nome=arquivo.filename or f"arquivo{sufixo}",
        mime=mime,
        tamanho_bytes=len(conteudo),
        storage_path=str(storage_path),
    )
