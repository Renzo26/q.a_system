# QA Argus

Plataforma de Quality Assurance com IA: conecta ao repositório, analisa alterações,
avalia risco, sugere testes e centraliza **defeitos com evidências** (prints, vídeos, gravação de tela).

## Stack

- **Frontend:** React 19 + TypeScript + Vite 7 + TanStack Router/Query + Tailwind 4
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2 (async) + Pydantic v2 + Alembic
- **Banco:** PostgreSQL (Supabase, asyncpg) · **Auth:** JWT
- **Deploy:** Docker Compose (VPS + EasyPanel)

## Estrutura

```
.
├── src/                 # Frontend (React)
├── backend/             # Backend (FastAPI) — ver backend/README.md
├── Dockerfile           # Build do frontend (Nginx)
├── nginx.conf           # SPA fallback
├── docker-compose.yml   # backend + frontend (EasyPanel)
└── .env.example         # variáveis (configurar no painel)
```

## Rodar em dev

```bash
# Backend (porta 8080)
cd backend && python -m venv .venv && . .venv/Scripts/activate
pip install -r requirements.txt && cp .env.example .env
uvicorn app.main:app --reload --port 8080

# Frontend (porta 5173) — em outro terminal
npm install && npm run dev
```

Usuário demo: `arthur@qaargus.dev` / `argus123`.

## Deploy no EasyPanel (Docker Compose)

1. **Crie um serviço Compose** apontando para este repositório.
2. **Configure as variáveis** (aba de Environment) conforme o `.env.example`:
   - Backend: `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `PUBLIC_BASE_URL`, `SUPABASE_*`, `OPENAI_API_KEY`.
   - Frontend (build-arg): `VITE_API_URL` = URL pública do backend.
3. **Domínios:** aponte um domínio para o serviço `frontend` (porta 80) e outro para o
   `backend` (porta 8080). Use as URLs resultantes em `VITE_API_URL`, `CORS_ORIGINS` e `PUBLIC_BASE_URL`.
4. **Deploy.** O backend roda as migrações Alembic no start e sobe na 8080; o frontend é
   buildado e servido por Nginx.

> A rede `easypanel` externa e os aliases (`qa-backend`, `qa-frontend`) já estão no compose.
> As evidências ficam no volume `backend_storage` (migrar para Supabase Storage numa próxima etapa).

## Segurança

Segredos **nunca** vão para o repositório (`.env`, `conexio_db.md` estão no `.gitignore`).
Configure tudo no painel do EasyPanel.
