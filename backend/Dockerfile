FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Em produção: roda as migrações Alembic e sobe o servidor.
# (Defina AUTO_CREATE_TABLES=false quando usar Alembic como fonte da verdade.)
CMD ["sh", "-c", "alembic upgrade head; uvicorn app.main:app --host 0.0.0.0 --port 8080"]
