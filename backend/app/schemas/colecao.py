from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelOut


class VariavelOut(CamelOut):
    chave: str
    valor: str


class PassoOut(CamelOut):
    ordem: int
    pasta: str
    nome: str
    metodo: str
    url: str
    descricao: str
    checks: list[str] = []
    body_resumo: str | None = None


class ColecaoOut(CamelOut):
    """Resumo (listagem)."""

    id: str
    nome: str
    descricao: str
    total_requests: int
    total_pastas: int
    criado_por: str
    projeto_id: str | None = None
    created_at: datetime = Field(serialization_alias="criadoEm")


class ColecaoDetalheOut(CamelOut):
    """Detalhe com o fluxo legível."""

    id: str
    nome: str
    descricao: str
    total_requests: int
    total_pastas: int
    variaveis: list[VariavelOut] = []
    passos: list[PassoOut] = []
