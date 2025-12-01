"""creating foreign_constraints

Revision ID: 171363f50b8b
Revises: 52b2fbf7308e
Create Date: 2025-11-30 08:50:52.040031

"""

from collections.abc import Sequence

from alembic import op

revision: str = '171363f50b8b'
down_revision: str | Sequence[str] | None = '52b2fbf7308e'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f('fk_notes_vocabulary_id_vocabularies'), 'notes', 'vocabularies', ['vocabulary_id'], ['id'])
    op.create_foreign_key(op.f('fk_resources_note_id_notes'), 'resources', 'notes', ['note_id'], ['id'])
    op.create_foreign_key(op.f('fk_vocabularies_lang_id_langs'), 'vocabularies', 'langs', ['lang_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('fk_vocabularies_lang_id_langs'), 'vocabularies', type_='foreignkey')
    op.drop_constraint(op.f('fk_resources_note_id_notes'), 'resources', type_='foreignkey')
    op.drop_constraint(op.f('fk_notes_vocabulary_id_vocabularies'), 'notes', type_='foreignkey')
