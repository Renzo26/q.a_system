from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.defeito import Defeito
from app.schemas.common import StatusDefeito
from app.schemas.defeito import DefeitoCreate
from app.services import evidencia_service


async def _proximo_codigo(db: AsyncSession) -> str:
    result = await db.execute(select(Defeito.codigo))
    numeros = []
    for (codigo,) in result.all():
        digitos = "".join(c for c in codigo if c.isdigit())
        if digitos:
            numeros.append(int(digitos))
    proximo = (max(numeros) if numeros else 0) + 1
    return f"BUG-{proximo:03d}"


async def listar(db: AsyncSession, status_filtro: str | None = None) -> list[Defeito]:
    stmt = select(Defeito).options(selectinload(Defeito.evidencias)).order_by(Defeito.created_at.desc())
    if status_filtro:
        stmt = stmt.where(Defeito.status == status_filtro)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def obter(db: AsyncSession, defeito_id: str) -> Defeito:
    stmt = select(Defeito).options(selectinload(Defeito.evidencias)).where(Defeito.id == defeito_id)
    result = await db.execute(stmt)
    defeito = result.scalar_one_or_none()
    if defeito is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Defeito não encontrado")
    return defeito


async def criar(db: AsyncSession, data: DefeitoCreate, criado_por: str) -> Defeito:
    defeito = Defeito(
        codigo=await _proximo_codigo(db),
        titulo=data.titulo,
        descricao=data.descricao,
        severidade=data.severidade.value,
        prioridade=data.prioridade.value,
        ambiente=data.ambiente,
        passos_reproducao=data.passos_reproducao,
        resultado_esperado=data.resultado_esperado,
        resultado_obtido=data.resultado_obtido,
        status="aberto",
        responsavel=data.responsavel or criado_por,
        criado_por=criado_por,
        caso_de_teste_id=data.vinculo.caso_de_teste_id,
        execucao_id=data.vinculo.execucao_id,
        pull_request=data.vinculo.pull_request,
    )
    db.add(defeito)
    await db.commit()
    return await obter(db, defeito.id)


async def atualizar_status(db: AsyncSession, defeito_id: str, novo_status: StatusDefeito) -> Defeito:
    defeito = await obter(db, defeito_id)
    defeito.status = novo_status.value
    await db.commit()
    return await obter(db, defeito_id)


async def remover(db: AsyncSession, defeito_id: str) -> None:
    defeito = await obter(db, defeito_id)
    await db.delete(defeito)
    await db.commit()


async def anexar_evidencias(
    db: AsyncSession, defeito_id: str, arquivos: list[UploadFile]
) -> Defeito:
    await obter(db, defeito_id)  # garante existência (404 se não)
    for arquivo in arquivos:
        evidencia = await evidencia_service.salvar_upload(defeito_id, arquivo)
        db.add(evidencia)
    await db.commit()
    return await obter(db, defeito_id)
