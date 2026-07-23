from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password
from app.models.defeito import Defeito, Evidencia
from app.models.teste import CasoDeTeste, Execucao
from app.models.user import User

CASOS = [
    ("TC-001", "Login com credenciais válidas", "E2E"),
    ("TC-014", "POST /pedidos cria pedido", "API"),
    ("TC-022", "Checkout aplica cupom de desconto", "E2E"),
    ("TC-031", "GET /produtos retorna paginação", "API"),
]

EXECUCOES = [
    ("EX-108", "Regressão API · homologação", "reprovado"),
    ("EX-107", "Smoke checkout · produção", "aprovado"),
    ("EX-104", "Coleção Postman · Pedidos", "reprovado"),
]


def _svg_bytes(label: str, tone: str) -> bytes:
    svg = (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'>"
        f"<rect width='200' height='120' fill='{tone}'/>"
        f"<rect width='200' height='20' fill='rgba(0,0,0,0.22)'/>"
        f"<circle cx='11' cy='10' r='3' fill='#f43f5e'/><circle cx='23' cy='10' r='3' fill='#f97316'/>"
        f"<circle cx='35' cy='10' r='3' fill='#12b886'/>"
        f"<text x='100' y='70' font-family='monospace' font-size='12' fill='rgba(255,255,255,0.9)' "
        f"text-anchor='middle'>{label}</text></svg>"
    )
    return svg.encode("utf-8")


def _salvar_evidencia_svg(defeito_id: str, nome: str, label: str, tone: str) -> Evidencia:
    dest_dir = Path(settings.STORAGE_DIR) / defeito_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    conteudo = _svg_bytes(label, tone)
    path = dest_dir / nome
    path.write_bytes(conteudo)
    return Evidencia(
        defeito_id=defeito_id,
        tipo="imagem",
        nome=nome,
        mime="image/svg+xml",
        tamanho_bytes=len(conteudo),
        storage_path=str(path),
    )


async def _tabela_vazia(db: AsyncSession, modelo) -> bool:
    total = await db.scalar(select(func.count()).select_from(modelo))
    return (total or 0) == 0


async def seed(db: AsyncSession) -> None:
    """Popula dados iniciais idempotentemente (só quando as tabelas estão vazias)."""

    # Usuário demo
    if await _tabela_vazia(db, User):
        db.add(
            User(
                name=settings.DEMO_USER_NAME,
                email=settings.DEMO_USER_EMAIL.lower(),
                senha_hash=hash_password(settings.DEMO_USER_PASSWORD),
                via="email",
            )
        )

    # Referências de teste
    if await _tabela_vazia(db, CasoDeTeste):
        for cid, nome, tipo in CASOS:
            db.add(CasoDeTeste(id=cid, nome=nome, tipo=tipo))
    if await _tabela_vazia(db, Execucao):
        for eid, nome, resultado in EXECUCOES:
            db.add(Execucao(id=eid, nome=nome, resultado=resultado))

    # Defeitos de exemplo
    if await _tabela_vazia(db, Defeito):
        autor = settings.DEMO_USER_NAME

        d1 = Defeito(
            codigo="BUG-001",
            titulo="Mensagem de erro de login não aparece",
            descricao="Com credenciais inválidas, o formulário não exibe feedback — o botão apenas para de carregar.",
            severidade="media",
            prioridade="media",
            ambiente="Desenvolvimento",
            passos_reproducao="1. Informar e-mail/senha inválidos\n2. Enviar o formulário",
            resultado_esperado="Mensagem 'Credenciais inválidas' abaixo do formulário.",
            resultado_obtido="Nenhuma mensagem é exibida.",
            status="resolvido",
            responsavel=autor,
            criado_por=autor,
            caso_de_teste_id="TC-001",
        )
        d2 = Defeito(
            codigo="BUG-002",
            titulo="Paginação de /produtos ignora page_size",
            descricao="O endpoint sempre retorna 20 itens, independentemente do parâmetro page_size enviado.",
            severidade="alta",
            prioridade="alta",
            ambiente="Homologação",
            passos_reproducao="1. GET /produtos?page_size=5\n2. Conferir a quantidade de itens no corpo",
            resultado_esperado="Retornar 5 itens.",
            resultado_obtido="Retorna 20 itens.",
            status="em_correcao",
            responsavel=autor,
            criado_por=autor,
            caso_de_teste_id="TC-031",
            execucao_id="EX-108",
            pull_request="#124",
        )
        d3 = Defeito(
            codigo="BUG-003",
            titulo="Checkout retorna 500 ao aplicar cupom expirado",
            descricao="Ao finalizar a compra com um cupom vencido, a API responde 500 em vez de uma mensagem de validação.",
            severidade="critica",
            prioridade="urgente",
            ambiente="Homologação",
            passos_reproducao="1. Adicionar item ao carrinho\n2. Aplicar o cupom PROMO2024 (expirado)\n3. Finalizar compra",
            resultado_esperado="Mensagem: 'Cupom expirado' e o checkout permanece utilizável.",
            resultado_obtido="HTTP 500 — Internal Server Error e tela em branco.",
            status="aberto",
            responsavel=autor,
            criado_por=autor,
            caso_de_teste_id="TC-022",
            execucao_id="EX-104",
            pull_request="#128",
        )
        db.add_all([d1, d2, d3])
        await db.flush()  # garante os ids antes de anexar evidências

        db.add(_salvar_evidencia_svg(d1.id, "login-sem-erro.svg", "login", "#134e4a"))
        db.add(_salvar_evidencia_svg(d2.id, "paginacao-bug.svg", "page_size", "#7c2d12"))
        db.add(_salvar_evidencia_svg(d3.id, "erro-500-checkout.svg", "500 · checkout", "#7f1d1d"))

    await db.commit()
