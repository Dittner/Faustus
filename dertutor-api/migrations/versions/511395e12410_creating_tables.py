"""creating tables

Revision ID: 511395e12410
Revises:
Create Date: 2025-11-21 19:33:06.545580

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '511395e12410'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'langs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=2), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_langs')),
        sa.UniqueConstraint('code', name=op.f('uq_langs_code')),
    )
    op.create_table(
        'vocabularies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('lang_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_vocabularies')),
        sa.UniqueConstraint('lang_id', 'name', name=op.f('uq_vocabularies_lang_id_name')),
    )
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.Text(), server_default='', nullable=False),
        sa.Column('text', sa.Text(), server_default='', nullable=False),
        sa.Column('level', sa.Enum('a1', 'a2', 'b1', 'b2', 'c1', 'c2', name='notelevel'), nullable=True),
        sa.Column('vocabulary_id', sa.Integer(), nullable=False),
        sa.Column('audio_url', sa.String(length=256), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_notes')),
        sa.UniqueConstraint('vocabulary_id', 'title', name=op.f('uq_notes_vocabulary_id_title')),
    )
    op.create_table(
        'resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('data', sa.LargeBinary(), nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_resources')),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('resources')
    op.drop_table('notes')
    op.drop_table('vocabularies')
    op.drop_table('langs')
