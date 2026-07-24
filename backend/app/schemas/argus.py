from app.schemas.common import CamelIn, CamelOut


class ChatMessageIn(CamelIn):
    role: str  # "user" | "assistant"
    content: str


class RepoRef(CamelIn):
    owner: str
    repo: str


class ChatIn(CamelIn):
    messages: list[ChatMessageIn]
    repo: RepoRef | None = None


class ChatOut(CamelOut):
    reply: str
