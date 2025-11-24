"""add_twitter_post_url

Revision ID: 1b127661301b
Revises: 5a4777f527ed
Create Date: 2025-11-23 16:16:43.487163

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b127661301b'
down_revision: Union[str, None] = '5a4777f527ed'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('news', sa.Column('twitter_post_url', sa.String(length=500), nullable=True))
    op.create_index(op.f('ix_news_twitter_post_url'), 'news', ['twitter_post_url'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_news_twitter_post_url'), table_name='news')
    op.drop_column('news', 'twitter_post_url')
