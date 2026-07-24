from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.argus import ChatIn, ChatOut
from app.services import argus_service

router = APIRouter(prefix="/argus", tags=["argus"])


@router.post("/chat", response_model=ChatOut)
async def chat(data: ChatIn, db: DbSession, _user: CurrentUser) -> ChatOut:
    mensagens = [{"role": m.role, "content": m.content} for m in data.messages]
    repo = {"owner": data.repo.owner, "repo": data.repo.repo} if data.repo else None
    reply = await argus_service.chat(db, mensagens, repo)
    return ChatOut(reply=reply)
