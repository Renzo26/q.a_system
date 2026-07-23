# QA Argus — Backend

API em **FastAPI + SQLAlchemy 2 (async) + Pydantic v2**, em arquitetura de camadas:

```
app/
  core/       config (pydantic-settings), database (async), security (JWT+hash), deps
  models/     ORM SQLAlchemy 2 (User, CasoDeTeste, Execucao, Defeito, Evidencia)
  schemas/    Pydantic In/Out — saída em camelCase (bate com as interfaces TS do front)
  services/   regra de negócio (auth, defeitos, evidências/storage, seed)
  api/        routers, um por módulo (auth, defeitos, evidencias, testes, health)
  main.py     app + CORS + lifespan (cria tabelas e roda o seed no dev)
```

## Rodar local (dev)

```bash
cd backend
python -m venv .venv
# Windows (PowerShell):  .venv\Scripts\Activate.ps1
# Linux/Mac:             source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env          # (cp no Linux/Mac)
uvicorn app.main:app --reload --port 8080
```

- Banco padrão: **SQLite** (`qa_argus.db`) — roda sem infra. As tabelas são criadas e populadas (seed) no start.
- Docs interativas: http://localhost:8080/docs
- Usuário demo: **arthur@qaargus.dev** / **argus123**

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Healthcheck |
| POST | `/api/auth/register` | Cadastro → JWT |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Usuário atual (Bearer) |
| GET | `/api/casos-de-teste` | Casos de teste (vínculo) |
| GET | `/api/execucoes` | Execuções (vínculo) |
| GET | `/api/defeitos?status=` | Lista defeitos |
| POST | `/api/defeitos` | Cria defeito |
| GET | `/api/defeitos/{id}` | Detalhe |
| PATCH | `/api/defeitos/{id}/status` | Troca status |
| DELETE | `/api/defeitos/{id}` | Remove |
| POST | `/api/defeitos/{id}/evidencias` | Anexa prints/vídeos (multipart) |
| GET | `/api/evidencias/{id}/conteudo` | Serve o arquivo |

Rotas protegidas exigem `Authorization: Bearer <token>`.

## Migrações (Alembic)

No dev, as tabelas são criadas automaticamente (`AUTO_CREATE_TABLES=true`). Para produção:

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

## Produção (Supabase + EasyPanel)

- `DATABASE_URL` com **asyncpg** no Session Pooler (porta 5432, IPv4).
- `AUTO_CREATE_TABLES=false` (Alembic como fonte da verdade).
- **Evidências** migram do disco local para o **Supabase Storage** (ajustar `evidencia_service`).
- **Hash de senha**: trocar para bcrypt conforme o padrão — `passlib[bcrypt]==1.7.4` + `bcrypt==3.2.2`
  (o `security.py` já aceita ambos os esquemas; no dev usamos `pbkdf2_sha256` porque o bcrypt 3.2.2
  não compila no Python 3.14).

## Ligar o frontend

No `.env` do frontend: `VITE_API_URL=http://localhost:8080`. Os schemas já respondem em camelCase,
próximos das interfaces em `src/lib/defeitos.ts`.
