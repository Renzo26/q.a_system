from functools import partial

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_id


class Colecao(Base, TimestampMixin):
    """Coleção do Postman importada (v2.1). Guarda o JSON bruto e alguns metadados;
    o fluxo legível é derivado do `raw` sob demanda pelo postman_service."""

    __tablename__ = "colecoes"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=partial(new_id, "col"))
    nome: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str] = mapped_column(Text, default="")
    total_requests: Mapped[int] = mapped_column(Integer, default=0)
    total_pastas: Mapped[int] = mapped_column(Integer, default=0)
    criado_por: Mapped[str] = mapped_column(String(120))
    raw: Mapped[dict] = mapped_column(JSON)

    projeto_id: Mapped[str | None] = mapped_column(
        ForeignKey("projetos.id", ondelete="SET NULL"), nullable=True, index=True
    )
