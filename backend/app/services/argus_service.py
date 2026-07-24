import json

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services import defeito_service, github_service, postman_service, repo_service

SYSTEM_PROMPT_BASE = """Você é o Argus, o agente de inteligência de Quality Assurance da plataforma QA Argus.
Ajuda o time de qualidade a entender os defeitos, as coleções de teste (Postman), o repositório e a saúde do projeto.

Regras:
- Responda SEMPRE em português do Brasil, de forma clara e objetiva — compreensível até para quem não é técnico.
- Use as ferramentas disponíveis para consultar os dados REAIS (defeitos, coleções, GitHub) antes de responder sobre eles. NUNCA invente números, códigos de defeito, commits ou passos de fluxo.
- Se uma ferramenta retornar um campo "erro", explique o problema ao usuário com naturalidade.
- Se não houver dados, diga isso com franqueza.
- Seja conciso. Use listas com "- " quando ajudar. Evite markdown pesado.
- Ao falar de um defeito, cite o código (ex: BUG-003), a severidade e o status.
- Ao explicar uma coleção, descreva o fluxo passo a passo em linguagem simples.
- Ao analisar commits/PRs, resuma o que mudou e o possível impacto em qualidade/testes."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "listar_defeitos",
            "description": "Lista os defeitos registrados no projeto, opcionalmente filtrando por status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "enum": [
                            "aberto",
                            "em_analise",
                            "em_correcao",
                            "pronto_reteste",
                            "resolvido",
                            "reaberto",
                            "cancelado",
                        ],
                    }
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "listar_colecoes",
            "description": "Lista as coleções do Postman importadas (nome, nº de requisições e pastas).",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "obter_fluxo_colecao",
            "description": "Retorna o fluxo detalhado (passos) de uma coleção pelo id.",
            "parameters": {
                "type": "object",
                "properties": {"colecao_id": {"type": "string"}},
                "required": ["colecao_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "github_info",
            "description": "Informações do repositório GitHub conectado (branch, linguagens, último push).",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "analisar_codigo",
            "description": (
                "Baixa o repositório conectado INTEIRO para dentro do sistema e retorna a "
                "estrutura completa de arquivos + o conteúdo dos arquivos-chave (README, "
                "package.json, configs, Dockerfile). É a ferramenta principal para entender a "
                "fundo O QUE o projeto faz, sua arquitetura e tecnologias. Use SEMPRE que "
                "perguntarem sobre o propósito, o funcionamento ou a estrutura do projeto."
            ),
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "ler_codigo",
            "description": (
                "Lê o conteúdo de um arquivo do repositório baixado, pelo caminho relativo "
                "(ex: src/App.tsx, backend/app/main.py). Use para aprofundar em arquivos "
                "encontrados na estrutura. Baixa o repositório automaticamente se necessário."
            ),
            "parameters": {
                "type": "object",
                "properties": {"caminho": {"type": "string", "description": "Caminho relativo do arquivo."}},
                "required": ["caminho"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "buscar_codigo",
            "description": (
                "Busca um termo em TODO o código do repositório baixado (como um grep): nome de "
                "função, rota, componente, endpoint, texto, etc. Retorna arquivos, linhas e "
                "trechos. Ótimo para rastrear onde algo é implementado ou usado."
            ),
            "parameters": {
                "type": "object",
                "properties": {"termo": {"type": "string", "description": "Texto a procurar no código."}},
                "required": ["termo"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "github_commits",
            "description": "Lista os commits recentes do repositório conectado.",
            "parameters": {
                "type": "object",
                "properties": {"limite": {"type": "integer", "description": "Quantos commits (padrão 10)."}},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "github_commit",
            "description": "Detalha um commit (mensagem, arquivos alterados, linhas +/-) pelo sha.",
            "parameters": {
                "type": "object",
                "properties": {"sha": {"type": "string"}},
                "required": ["sha"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "github_pull_requests",
            "description": "Lista pull requests do repositório conectado.",
            "parameters": {
                "type": "object",
                "properties": {"state": {"type": "string", "enum": ["open", "closed", "all"]}},
                "required": [],
            },
        },
    },
]


async def _executar_tool(db: AsyncSession, nome: str, args: dict, repo: dict | None) -> object:
    if nome == "listar_defeitos":
        defeitos = await defeito_service.listar(db, args.get("status"))
        return [
            {
                "codigo": d.codigo,
                "titulo": d.titulo,
                "severidade": d.severidade,
                "prioridade": d.prioridade,
                "status": d.status,
                "ambiente": d.ambiente,
                "responsavel": d.responsavel,
                "vinculo": d.vinculo,
                "evidencias": len(d.evidencias),
            }
            for d in defeitos
        ]
    if nome == "listar_colecoes":
        colecoes = await postman_service.listar(db)
        return [
            {
                "id": c.id,
                "nome": c.nome,
                "descricao": c.descricao,
                "totalRequests": c.total_requests,
                "totalPastas": c.total_pastas,
            }
            for c in colecoes
        ]
    if nome == "obter_fluxo_colecao":
        detalhe = await postman_service.obter_detalhe(db, args["colecao_id"])
        return {
            "nome": detalhe["nome"],
            "passos": [
                {
                    "ordem": p["ordem"],
                    "pasta": p["pasta"],
                    "metodo": p["metodo"],
                    "nome": p["nome"],
                    "url": p["url"],
                    "descricao": p["descricao"],
                    "checks": p["checks"],
                }
                for p in detalhe["passos"]
            ],
        }

    if nome.startswith("github_") or nome in {"analisar_codigo", "ler_codigo", "buscar_codigo"}:
        if not repo:
            return {"erro": "Nenhum repositório conectado. Peça ao usuário para conectar um repositório na tela 'Conectar repositório'."}
        owner, nome_repo = repo["owner"], repo["repo"]
        try:
            if nome == "github_info":
                return await github_service.info_repo(owner, nome_repo)
            if nome == "analisar_codigo":
                return await repo_service.analisar(owner, nome_repo)
            if nome == "ler_codigo":
                caminho = args.get("caminho")
                if not caminho:
                    return {"erro": "Informe o caminho do arquivo."}
                return await repo_service.ler_arquivo(owner, nome_repo, caminho)
            if nome == "buscar_codigo":
                termo = args.get("termo")
                if not termo:
                    return {"erro": "Informe o termo de busca."}
                return await repo_service.buscar(owner, nome_repo, termo)
            if nome == "github_commits":
                return await github_service.listar_commits(owner, nome_repo, limite=int(args.get("limite", 10)))
            if nome == "github_commit":
                return await github_service.detalhar_commit(owner, nome_repo, args["sha"])
            if nome == "github_pull_requests":
                return await github_service.listar_pull_requests(owner, nome_repo, args.get("state", "open"))
        except github_service.GitHubError as e:
            return {"erro": str(e)}

    return {"erro": f"ferramenta desconhecida: {nome}"}


def _system_prompt(repo: dict | None) -> str:
    if repo:
        return (
            f"{SYSTEM_PROMPT_BASE}\n\nRepositório conectado: {repo['owner']}/{repo['repo']}. "
            "Você pode BAIXAR o repositório inteiro para o sistema e analisá-lo a fundo. "
            "Para explicar o que o projeto faz, sua arquitetura ou estrutura, chame SEMPRE "
            "analisar_codigo primeiro — ele traz a árvore de arquivos e os arquivos-chave. "
            "Depois, se precisar de detalhes, use ler_codigo (abrir um arquivo específico) e "
            "buscar_codigo (procurar um termo em todo o código). Use github_commits, "
            "github_commit e github_pull_requests para histórico e mudanças. "
            "NUNCA diga que 'não é possível saber o que o projeto faz' sem antes chamar "
            "analisar_codigo e inspecionar os arquivos-chave e a pasta de código-fonte."
        )
    return (
        f"{SYSTEM_PROMPT_BASE}\n\nNenhum repositório está conectado no momento. "
        "Se perguntarem sobre commits, código ou o repositório, explique que é preciso conectar "
        "um repositório na tela 'Conectar repositório'."
    )


async def chat(db: AsyncSession, mensagens: list[dict], repo: dict | None = None) -> str:
    if not settings.OPENAI_API_KEY:
        return "⚠️ A IA ainda não está configurada. Defina a variável OPENAI_API_KEY no backend."

    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    convo: list[dict] = [{"role": "system", "content": _system_prompt(repo)}, *mensagens]

    try:
        for _ in range(6):
            resp = await client.chat.completions.create(
                model=settings.ARGUS_MODEL,
                messages=convo,
                tools=TOOLS,
                temperature=0.3,
            )
            msg = resp.choices[0].message

            if not msg.tool_calls:
                return msg.content or ""

            convo.append(
                {
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                        }
                        for tc in msg.tool_calls
                    ],
                }
            )
            for tc in msg.tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                resultado = await _executar_tool(db, tc.function.name, args, repo)
                convo.append(
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(resultado, ensure_ascii=False, default=str),
                    }
                )

        return "Não consegui concluir a análise agora. Tente reformular a pergunta."
    except Exception as e:  # noqa: BLE001
        return f"⚠️ Erro ao falar com a IA: {e}"
