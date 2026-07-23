from fastapi import APIRouter

from app.api import auth, defeitos, evidencias, health, testes

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(testes.router)
api_router.include_router(defeitos.router)
api_router.include_router(evidencias.router)
