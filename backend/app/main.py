from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import SessionLocal, engine
from app.models import Base  # noqa: F401 — importa todos os models (registra o metadata)
from app.services.seed import seed


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Dev: cria as tabelas automaticamente. Produção: usar Alembic (AUTO_CREATE_TABLES=false).
    if settings.AUTO_CREATE_TABLES:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    if settings.SEED_ON_START:
        async with SessionLocal() as db:
            await seed(db)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Backend do Hunter Q.A — análise de qualidade, defeitos e evidências.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["root"])
async def root() -> dict:
    return {"app": settings.APP_NAME, "docs": "/docs", "api": "/api"}
