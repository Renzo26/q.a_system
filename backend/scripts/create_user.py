"""Cria um usuário direto no banco (contorna a validação de senha mínima do /register).

Uso:
    python -m scripts.create_user "Nome" email@dominio.com senha
"""
import asyncio
import sys

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.services.auth_service import get_by_email


async def main(name: str, email: str, senha: str) -> None:
    async with SessionLocal() as db:
        if await get_by_email(db, email):
            print(f"Usuário já existe: {email}")
            return
        db.add(User(name=name, email=email.lower(), senha_hash=hash_password(senha), via="email"))
        await db.commit()
        print(f"Usuário criado: {email} (senha: {senha})")


if __name__ == "__main__":
    nome = sys.argv[1] if len(sys.argv) > 1 else "Bia QA"
    mail = sys.argv[2] if len(sys.argv) > 2 else "biaqa@gmail.com"
    pwd = sys.argv[3] if len(sys.argv) > 3 else "123"
    asyncio.run(main(nome, mail, pwd))
