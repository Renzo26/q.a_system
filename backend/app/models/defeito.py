from functools import partial

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import settings
from app.models.base import Base, TimestampMixin, new_id


class Defeito(Base, TimestampMixin):
    __tablename__ = "defeitos"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=partial(new_id, "def"))
    codigo: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # BUG-001

    titulo: Mapped[str] = mapped_column(String(200))
    descricao: Mapped[str] = mapped_column(Text)
    severidade: Mapped[str] = mapped_column(String(20))  # critica | alta | media | baixa
    prioridade: Mapped[str] = mapped_column(String(20))  # urgente | alta | media | baixa
    ambiente: Mapped[str] = mapped_column(String(60))
    passos_reproducao: Mapped[str] = mapped_column(Text)
    resultado_esperado: Mapped[str] = mapped_column(Text)
    resultado_obtido: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="aberto", index=True)
    responsavel: Mapped[str] = mapped_column(String(120))
    criado_por: Mapped[str] = mapped_column(String(120))

    # Vínculo / rastreabilidade (#18)
    caso_de_teste_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    execucao_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    pull_request: Mapped[str | None] = mapped_column(String(40), nullable=True)

    evidencias: Mapped[list["Evidencia"]] = relationship(
        back_populates="defeito",
        cascade="all, delete-orphan",
        order_by="Evidencia.created_at",
    )

    @property
    def vinculo(self) -> dict:
        return {
            "caso_de_teste_id": self.caso_de_teste_id,
            "execucao_id": self.execucao_id,
            "pull_request": self.pull_request,
        }


class Evidencia(Base, TimestampMixin):
    __tablename__ = "evidencias"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=partial(new_id, "ev"))
    defeito_id: Mapped[str] = mapped_column(
        ForeignKey("defeitos.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(30))  # imagem | video | log | request_response | arquivo
    nome: Mapped[str] = mapped_column(String(255))
    mime: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    tamanho_bytes: Mapped[int] = mapped_column(Integer, default=0)
    storage_path: Mapped[str] = mapped_column(String(500))

    defeito: Mapped[Defeito] = relationship(back_populates="evidencias")

    @property
    def url(self) -> str:
        return f"{settings.PUBLIC_BASE_URL}/api/evidencias/{self.id}/conteudo"
