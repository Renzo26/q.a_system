from fastapi import APIRouter

from app.api import (
    argus,
    auth,
    colecoes,
    defeitos,
    evidencias,
    github,
    health,
    projetos,
    testes,
)

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(testes.router)
api_router.include_router(defeitos.router)
api_router.include_router(evidencias.router)
api_router.include_router(colecoes.router)
api_router.include_router(argus.router)
api_router.include_router(github.router)
api_router.include_router(projetos.router)
