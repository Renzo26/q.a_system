from fastapi import APIRouter, HTTPException, Query, status

from app.core.deps import CurrentUser
from app.schemas.github import RepoInfoOut
from app.services import github_service
from app.services.github_service import GitHubError

router = APIRouter(prefix="/github", tags=["github"])


@router.get("/repo", response_model=RepoInfoOut)
async def obter_repo(
    _user: CurrentUser,
    owner: str = Query(..., min_length=1),
    repo: str = Query(..., min_length=1),
) -> dict:
    try:
        return await github_service.info_repo(owner, repo)
    except GitHubError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e))
