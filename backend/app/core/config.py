from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração central (pydantic-settings). Lê de variáveis de ambiente e .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    APP_NAME: str = "Hunter Q.A API"
    ENV: str = "dev"

    # Banco — default SQLite async para rodar sem infra; asyncpg/Supabase em produção.
    DATABASE_URL: str = "sqlite+aiosqlite:///./qa_argus.db"

    # Segurança
    SECRET_KEY: str = "dev-secret-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # CORS — string separada por vírgula (evita parsing JSON do pydantic-settings)
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Storage de evidências
    STORAGE_DIR: str = "./storage"
    PUBLIC_BASE_URL: str = "http://localhost:8080"

    # Supabase (Storage/admin) e IA — opcionais, usados nas próximas etapas.
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    ARGUS_MODEL: str = "gpt-4o-mini"
    GITHUB_TOKEN: str = ""  # opcional: aumenta o limite da API e permite repos privados

    # Bootstrap
    AUTO_CREATE_TABLES: bool = True
    SEED_ON_START: bool = True
    DEMO_USER_NAME: str = "Arthur Renzo"
    DEMO_USER_EMAIL: str = "arthur@qaargus.dev"
    DEMO_USER_PASSWORD: str = "argus123"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
