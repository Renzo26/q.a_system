from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# SQLite precisa de check_same_thread=False.
# Postgres/Supabase exige SSL; statement_cache_size=0 evita conflito de prepared
# statements com o pooler (pgbouncer) do Supabase.
if settings.is_sqlite:
    _connect_args: dict = {"check_same_thread": False}
else:
    _connect_args = {"ssl": "require", "statement_cache_size": 0}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args=_connect_args,
)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependência FastAPI: fornece uma sessão async por request."""
    async with SessionLocal() as session:
        yield session
