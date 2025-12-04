"""creating tables

Revision ID: 940fff0fde75
Revises:
Create Date: 2025-12-02 05:29:44.899765

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = '940fff0fde75'
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
        'media',
        sa.Column('uid', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=False),
        sa.Column('media_type', sa.String(length=256), nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('uid', name=op.f('pk_media')),
        sa.UniqueConstraint('note_id', 'uid', name=op.f('uq_media_note_id_uid')),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('media')
    op.drop_table('notes')
    op.drop_table('vocabularies')
    op.drop_table('langs')
