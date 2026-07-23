from app.schemas.common import CamelOut


class CasoDeTesteOut(CamelOut):
    id: str
    nome: str
    tipo: str


class ExecucaoOut(CamelOut):
    id: str
    nome: str
    resultado: str
