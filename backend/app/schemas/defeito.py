from datetime import datetime

from pydantic import Field

from app.schemas.common import (
    CamelIn,
    CamelOut,
    Prioridade,
    Severidade,
    StatusDefeito,
    TipoEvidencia,
)


class VinculoIn(CamelIn):
    caso_de_teste_id: str | None = None
    execucao_id: str | None = None
    pull_request: str | None = None


class VinculoOut(CamelOut):
    caso_de_teste_id: str | None = None
    execucao_id: str | None = None
    pull_request: str | None = None


class EvidenciaOut(CamelOut):
    id: str
    tipo: TipoEvidencia
    nome: str
    url: str
    tamanho_bytes: int
    created_at: datetime = Field(serialization_alias="criadoEm")


class DefeitoCreate(CamelIn):
    titulo: str = Field(min_length=4)
    descricao: str = Field(min_length=10)
    severidade: Severidade
    prioridade: Prioridade
    ambiente: str = Field(min_length=1)
    passos_reproducao: str = Field(min_length=1)
    resultado_esperado: str = Field(min_length=1)
    resultado_obtido: str = Field(min_length=1)
    responsavel: str | None = None
    projeto_id: str | None = None
    vinculo: VinculoIn = VinculoIn()


class StatusUpdate(CamelIn):
    status: StatusDefeito


class ProjetoUpdate(CamelIn):
    projeto_id: str | None = None


class DefeitoOut(CamelOut):
    id: str
    codigo: str
    titulo: str
    descricao: str
    severidade: Severidade
    prioridade: Prioridade
    ambiente: str
    passos_reproducao: str
    resultado_esperado: str
    resultado_obtido: str
    status: StatusDefeito
    responsavel: str
    criado_por: str
    projeto_id: str | None = None
    created_at: datetime = Field(serialization_alias="criadoEm")
    updated_at: datetime = Field(serialization_alias="atualizadoEm")
    vinculo: VinculoOut
    evidencias: list[EvidenciaOut] = []
