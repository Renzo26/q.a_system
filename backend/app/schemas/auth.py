from pydantic import EmailStr, Field

from app.schemas.common import CamelIn, CamelOut
from app.schemas.user import UserPublic


class RegisterIn(CamelIn):
    name: str = Field(min_length=2)
    email: EmailStr
    senha: str = Field(min_length=6)


class LoginIn(CamelIn):
    email: EmailStr
    senha: str = Field(min_length=1)


class Token(CamelOut):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
