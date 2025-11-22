"""creating foreign_constraints

Revision ID: c0b0fc3167db
Revises: 511395e12410
Create Date: 2025-11-21 19:33:58.388528

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c0b0fc3167db'
down_revision: str | Sequence[str] | None = '511395e12410'
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
