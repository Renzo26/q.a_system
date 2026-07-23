from fastapi import APIRouter, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.auth import LoginIn, RegisterIn, Token
from app.schemas.user import UserOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterIn, db: DbSession) -> Token:
    return await auth_service.register(db, data)


@router.post("/login", response_model=Token)
async def login(data: LoginIn, db: DbSession) -> Token:
    return await auth_service.login(db, data)


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    return UserOut.model_validate(user)
