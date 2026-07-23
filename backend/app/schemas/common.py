from enum import Enum

from pydantic import AliasGenerator, BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelOut(BaseModel):
    """Saída: lê atributos snake_case do ORM e serializa em camelCase para o frontend.

    Só o *serialization_alias* é camelizado — a validação continua por nome de campo
    (snake_case), evitando o gotcha de `from_attributes` procurar atributos camelCase.
    O FastAPI serializa respostas com by_alias=True por padrão.
    """

    model_config = ConfigDict(
        alias_generator=AliasGenerator(serialization_alias=to_camel),
        populate_by_name=True,
        from_attributes=True,
    )


class CamelIn(BaseModel):
    """Entrada: aceita camelCase (do frontend) e também snake_case."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Severidade(str, Enum):
    critica = "critica"
    alta = "alta"
    media = "media"
    baixa = "baixa"


class Prioridade(str, Enum):
    urgente = "urgente"
    alta = "alta"
    media = "media"
    baixa = "baixa"


class StatusDefeito(str, Enum):
    aberto = "aberto"
    em_analise = "em_analise"
    em_correcao = "em_correcao"
    pronto_reteste = "pronto_reteste"
    resolvido = "resolvido"
    reaberto = "reaberto"
    cancelado = "cancelado"


class TipoEvidencia(str, Enum):
    imagem = "imagem"
    video = "video"
    log = "log"
    request_response = "request_response"
    arquivo = "arquivo"
