from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin

# Referências para vínculo/rastreabilidade (#7 Casos de teste, #10 Execuções).
# Nesta etapa são semeadas e lidas; a criação/execução vem com o módulo Postman/Newman.


class CasoDeTeste(Base, TimestampMixin):
    __tablename__ = "casos_de_teste"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)  # ex: TC-001
    nome: Mapped[str] = mapped_column(String(200))
    tipo: Mapped[str] = mapped_column(String(20))  # API | E2E | Integração


class Execucao(Base, TimestampMixin):
    __tablename__ = "execucoes"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)  # ex: EX-108
    nome: Mapped[str] = mapped_column(String(200))
    resultado: Mapped[str] = mapped_column(String(20))  # aprovado | reprovado
