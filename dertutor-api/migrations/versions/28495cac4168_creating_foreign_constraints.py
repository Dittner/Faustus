"""creating foreign_constraints

Revision ID: 28495cac4168
Revises: a40b0ee329b9
Create Date: 2025-12-20 02:34:13.347284

"""

from collections.abc import Sequence

from alembic import op

revision: str = '28495cac4168'
down_revision: str | Sequence[str] | None = 'a40b0ee329b9'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_foreign_key(op.f('fk_media_note_id_notes'), 'media', 'notes', ['note_id'], ['id'])
    op.create_foreign_key(op.f('fk_notes_lang_id_langs'), 'notes', 'langs', ['lang_id'], ['id'])
    op.create_foreign_key(op.f('fk_notes_voc_id_vocs'), 'notes', 'vocs', ['voc_id'], ['id'])
    op.create_foreign_key(op.f('fk_notes_tag_id_tags'), 'notes', 'tags', ['tag_id'], ['id'])
    op.create_foreign_key(op.f('fk_tags_lang_id_langs'), 'tags', 'langs', ['lang_id'], ['id'])
    op.create_foreign_key(op.f('fk_vocs_lang_id_langs'), 'vocs', 'langs', ['lang_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(op.f('fk_vocs_lang_id_langs'), 'vocs', type_='foreignkey')
    op.drop_constraint(op.f('fk_tags_lang_id_langs'), 'tags', type_='foreignkey')
    op.drop_constraint(op.f('fk_notes_tag_id_tags'), 'notes', type_='foreignkey')
    op.drop_constraint(op.f('fk_notes_voc_id_vocs'), 'notes', type_='foreignkey')
    op.drop_constraint(op.f('fk_notes_lang_id_langs'), 'notes', type_='foreignkey')
    op.drop_constraint(op.f('fk_media_note_id_notes'), 'media', type_='foreignkey')
