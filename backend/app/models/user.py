from functools import partial

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, new_id


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=partial(new_id, "usr"))
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))
    via: Mapped[str] = mapped_column(String(20), default="email")  # email | github

    # Repositório GitHub conectado — fica no usuário para sobreviver a logout e troca de máquina
    repo_owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    repo_name: Mapped[str | None] = mapped_column(String(160), nullable=True)

    @property
    def repo(self) -> dict | None:
        if self.repo_owner and self.repo_name:
            return {"owner": self.repo_owner, "repo": self.repo_name}
        return None
