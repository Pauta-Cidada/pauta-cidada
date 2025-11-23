"""add_tipo_autor_column

Revision ID: 5a4777f527ed
Revises: 1f43557e4949
Create Date: 2025-11-22 17:44:46.232707

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a4777f527ed'
down_revision: Union[str, None] = '1f43557e4949'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('news', sa.Column('author_type', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('news', 'author_type')
