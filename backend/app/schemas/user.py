from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelOut


class UserOut(CamelOut):
    id: str
    name: str
    email: str
    via: str
    created_at: datetime = Field(serialization_alias="createdAt")


class UserPublic(CamelOut):
    """Formato que o frontend guarda no estado de auth (com iniciais)."""

    name: str
    email: str
    initials: str
    via: str
