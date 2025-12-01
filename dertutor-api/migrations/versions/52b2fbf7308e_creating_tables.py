"""creating tables

Revision ID: 52b2fbf7308e
Revises:
Create Date: 2025-11-30 08:48:52.109154

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '52b2fbf7308e'
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
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('vocabulary_id', sa.Integer(), nullable=False),
        sa.Column('audio_url', sa.String(length=256), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_notes')),
        sa.UniqueConstraint('vocabulary_id', 'title', name=op.f('uq_notes_vocabulary_id_title')),
    )
    op.create_table(
        'resources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('url', sa.String(length=256), nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_resources')),
        sa.UniqueConstraint('note_id', 'id', name=op.f('uq_resources_note_id_id')),
        sa.UniqueConstraint('url', name=op.f('uq_resources_url')),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('resources')
    op.drop_table('notes')
    op.drop_table('vocabularies')
    op.drop_table('langs')
