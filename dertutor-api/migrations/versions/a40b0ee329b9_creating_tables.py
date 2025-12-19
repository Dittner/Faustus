"""creating tables

Revision ID: a40b0ee329b9
Revises:
Create Date: 2025-12-20 02:32:15.267231

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'a40b0ee329b9'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'langs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=2), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_langs')),
        sa.UniqueConstraint('code', name=op.f('uq_langs_code')),
    )
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Text(), server_default='', nullable=False),
        sa.Column('lang_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_tags')),
        sa.UniqueConstraint('lang_id', 'name', name=op.f('uq_tags_lang_id_name')),
    )
    op.create_table(
        'vocs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('lang_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_vocs')),
        sa.UniqueConstraint('lang_id', 'name', name=op.f('uq_vocs_lang_id_name')),
    )
    op.create_table(
        'notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.Text(), server_default='', nullable=False),
        sa.Column('text', sa.Text(), server_default='', nullable=False),
        sa.Column('lang_id', sa.Integer(), nullable=False),
        sa.Column('voc_id', sa.Integer(), nullable=False),
        sa.Column('audio_url', sa.String(length=255), nullable=False),
        sa.Column('level', sa.Integer(), nullable=True),
        sa.Column('tag_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_notes')),
        sa.UniqueConstraint('voc_id', 'name', name=op.f('uq_notes_voc_id_name')),
    )
    op.create_table(
        'media',
        sa.Column('uid', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('media_type', sa.String(length=255), nullable=False),
        sa.Column('note_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('uid', name=op.f('pk_media')),
        sa.UniqueConstraint('note_id', 'uid', name=op.f('uq_media_note_id_uid')),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('media')
    op.drop_table('notes')
    op.drop_table('vocs')
    op.drop_table('tags')
    op.drop_table('langs')
