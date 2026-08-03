from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelIn, CamelOut


class RepoRef(CamelOut):
    owner: str
    repo: str


class UserOut(CamelOut):
    id: str
    name: str
    email: str
    via: str
    repo: RepoRef | None = None
    created_at: datetime = Field(serialization_alias="createdAt")


class UserPublic(CamelOut):
    """Formato que o frontend guarda no estado de auth (com iniciais)."""

    name: str
    email: str
    initials: str
    via: str
    repo: RepoRef | None = None


class RepoIn(CamelIn):
    """Conectar (owner + repo) ou desconectar (ambos nulos) o repositório do usuário."""

    owner: str | None = None
    repo: str | None = None
