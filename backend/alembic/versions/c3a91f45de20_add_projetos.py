"""add projetos e vinculo com defeitos/colecoes

Revision ID: c3a91f45de20
Revises: b6e7de9bcb9b
Create Date: 2026-08-03 15:40:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "c3a91f45de20"
down_revision: str | None = "b6e7de9bcb9b"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "projetos",
        sa.Column("id", sa.String(length=40), nullable=False),
        sa.Column("chave", sa.String(length=20), nullable=False),
        sa.Column("nome", sa.String(length=160), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("repo_owner", sa.String(length=120), nullable=True),
        sa.Column("repo_name", sa.String(length=160), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("responsavel", sa.String(length=120), nullable=False),
        sa.Column("criado_por", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_projetos_chave", "projetos", ["chave"], unique=True)
    op.create_index("ix_projetos_status", "projetos", ["status"])

    # Vínculo opcional: registros antigos ficam com projeto_id nulo.
    for tabela in ("defeitos", "colecoes"):
        with op.batch_alter_table(tabela) as batch:
            batch.add_column(sa.Column("projeto_id", sa.String(length=40), nullable=True))
            batch.create_foreign_key(
                f"fk_{tabela}_projeto_id", "projetos", ["projeto_id"], ["id"], ondelete="SET NULL"
            )
        op.create_index(f"ix_{tabela}_projeto_id", tabela, ["projeto_id"])


def downgrade() -> None:
    for tabela in ("defeitos", "colecoes"):
        op.drop_index(f"ix_{tabela}_projeto_id", table_name=tabela)
        with op.batch_alter_table(tabela) as batch:
            batch.drop_constraint(f"fk_{tabela}_projeto_id", type_="foreignkey")
            batch.drop_column("projeto_id")

    op.drop_index("ix_projetos_status", table_name="projetos")
    op.drop_index("ix_projetos_chave", table_name="projetos")
    op.drop_table("projetos")
