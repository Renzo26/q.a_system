from functools import partial

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_id


class Projeto(Base, TimestampMixin):
    """Projeto de QA: agrupa defeitos e coleções sob um mesmo produto/repositório."""

    __tablename__ = "projetos"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=partial(new_id, "prj"))
    chave: Mapped[str] = mapped_column(String(20), unique=True, index=True)  # SEFAZ, PORTAL…
    nome: Mapped[str] = mapped_column(String(160))
    descricao: Mapped[str] = mapped_column(Text, default="")

    # Repositório GitHub vinculado (opcional)
    repo_owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    repo_name: Mapped[str | None] = mapped_column(String(160), nullable=True)

    status: Mapped[str] = mapped_column(String(20), default="ativo", index=True)
    responsavel: Mapped[str] = mapped_column(String(120), default="")
    criado_por: Mapped[str] = mapped_column(String(120))

    @property
    def repo(self) -> dict | None:
        if self.repo_owner and self.repo_name:
            return {"owner": self.repo_owner, "repo": self.repo_name}
        return None
