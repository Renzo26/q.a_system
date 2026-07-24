from app.schemas.common import CamelOut


class RepoInfoOut(CamelOut):
    owner: str
    repo: str
    descricao: str
    default_branch: str
    linguagens: list[str] = []
    stars: int
    visibilidade: str
    url: str
    atualizado_em: str | None = None
    issues_abertas: int
