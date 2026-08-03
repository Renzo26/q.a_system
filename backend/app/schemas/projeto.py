from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.common import CamelIn, CamelOut, Severidade, StatusDefeito, StatusProjeto


class RepoRef(CamelOut):
    owner: str
    repo: str


class ProjetoCreate(CamelIn):
    nome: str = Field(min_length=2, max_length=160)
    chave: str = Field(min_length=2, max_length=20)
    descricao: str = ""
    repo_owner: str | None = None
    repo_name: str | None = None
    responsavel: str | None = None
    status: StatusProjeto = StatusProjeto.ativo

    @field_validator("chave")
    @classmethod
    def chave_maiuscula(cls, v: str) -> str:
        limpa = "".join(c for c in v.strip().upper() if c.isalnum() or c in "-_")
        if not limpa:
            raise ValueError("Chave inválida: use letras, números, hífen ou underline.")
        return limpa


class ProjetoUpdate(CamelIn):
    nome: str | None = Field(default=None, min_length=2, max_length=160)
    descricao: str | None = None
    repo_owner: str | None = None
    repo_name: str | None = None
    responsavel: str | None = None
    status: StatusProjeto | None = None


class ProjetoOut(CamelOut):
    id: str
    chave: str
    nome: str
    descricao: str
    status: StatusProjeto
    responsavel: str
    criado_por: str
    repo: RepoRef | None = None
    created_at: datetime = Field(serialization_alias="criadoEm")
    updated_at: datetime = Field(serialization_alias="atualizadoEm")


class MetricasProjeto(CamelOut):
    """Números reais, derivados dos defeitos e coleções vinculados ao projeto."""

    defeitos_total: int = 0
    defeitos_abertos: int = 0
    defeitos_criticos: int = 0
    defeitos_resolvidos: int = 0
    colecoes_total: int = 0
    requests_total: int = 0
    por_severidade: dict[Severidade, int] = {}
    por_status: dict[StatusDefeito, int] = {}
    ultimo_defeito_em: datetime | None = None


class ProjetoComMetricas(ProjetoOut):
    metricas: MetricasProjeto


class ResumoProjetos(CamelOut):
    """Agregado do dashboard — respeita o filtro por projeto quando houver."""

    projetos_total: int
    projetos_ativos: int
    metricas: MetricasProjeto
    sem_projeto: int = Field(
        default=0, description="Defeitos ainda não atribuídos a nenhum projeto"
    )
