"""repositorio conectado fica salvo no usuario

Revision ID: d5b2074ec918
Revises: c3a91f45de20
Create Date: 2026-08-03 16:20:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "d5b2074ec918"
down_revision: str | None = "c3a91f45de20"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column("repo_owner", sa.String(length=120), nullable=True))
        batch.add_column(sa.Column("repo_name", sa.String(length=160), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_column("repo_name")
        batch.drop_column("repo_owner")
