"""creating foreign_constraints

Revision ID: 2022dfb5582c
Revises: 940fff0fde75
Create Date: 2025-12-02 05:31:54.721747

"""

from collections.abc import Sequence

from alembic import op

revision: str = '2022dfb5582c'
down_revision: str | Sequence[str] | None = '940fff0fde75'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f('fk_media_note_id_notes'), 'media', 'notes', ['note_id'], ['id'])
    op.create_foreign_key(op.f('fk_notes_vocabulary_id_vocabularies'), 'notes', 'vocabularies', ['vocabulary_id'], ['id'])
    op.create_foreign_key(op.f('fk_vocabularies_lang_id_langs'), 'vocabularies', 'langs', ['lang_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('fk_vocabularies_lang_id_langs'), 'vocabularies', type_='foreignkey')
    op.drop_constraint(op.f('fk_notes_vocabulary_id_vocabularies'), 'notes', type_='foreignkey')
    op.drop_constraint(op.f('fk_media_note_id_notes'), 'media', type_='foreignkey')
