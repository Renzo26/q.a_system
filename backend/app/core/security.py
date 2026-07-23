from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Dev (Python 3.14, sem compilador): pbkdf2_sha256 puro Python.
# Produção (CLAUDE.md): trocar para bcrypt — schemes=["bcrypt"] com
# passlib[bcrypt]==1.7.4 + bcrypt==3.2.2. Hashes antigos continuam válidos
# porque o contexto aceita ambos os esquemas.
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def hash_password(senha: str) -> str:
    return pwd_context.hash(senha)


def verify_password(senha: str, senha_hash: str) -> bool:
    try:
        return pwd_context.verify(senha, senha_hash)
    except ValueError:
        return False


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Retorna o subject (id do usuário) ou None se inválido/expirado."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        sub = payload.get("sub")
        return str(sub) if sub is not None else None
    except JWTError:
        return None
