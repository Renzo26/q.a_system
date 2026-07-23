from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginIn, RegisterIn, Token
from app.schemas.user import UserPublic


def _initials(name: str) -> str:
    partes = [p for p in name.split() if p]
    return ("".join(p[0] for p in partes[:2]) or "?").upper()


def _to_public(user: User) -> UserPublic:
    return UserPublic(name=user.name, email=user.email, initials=_initials(user.name), via=user.via)


def _token_for(user: User) -> Token:
    return Token(access_token=create_access_token(user.id), user=_to_public(user))


async def get_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def register(db: AsyncSession, data: RegisterIn) -> Token:
    if await get_by_email(db, data.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")
    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        senha_hash=hash_password(data.senha),
        via="email",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _token_for(user)


async def login(db: AsyncSession, data: LoginIn) -> Token:
    user = await get_by_email(db, data.email)
    if user is None or not verify_password(data.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )
    return _token_for(user)
