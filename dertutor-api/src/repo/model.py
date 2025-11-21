import enum
from sqlalchemy import ForeignKey, LargeBinary, MetaData, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Enum as SQLEnum # Alias to avoid conflict with Python's enum

class Base(DeclarativeBase):
    __abstract__ = True
    metadata = MetaData(
        naming_convention={
            'ix': 'ix_%(column_0_label)s',
            'uq': 'uq_%(table_name)s_%(column_0_N_name)s',
            'ck': 'ck_%(table_name)s_%(constraint_name)s',
            'fk': 'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s',
            'pk': 'pk_%(table_name)s',
        }
    )


class Lang(Base):
    __tablename__ = 'langs'
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(2), unique=True)  # en, de, ru
    name: Mapped[str] = mapped_column(String(256))
    vocabularies: Mapped[list['Vocabulary']] = relationship(cascade='all, delete')

    def __repr__(self):
        return f"<Lang(id='{self.id}', code='{self.code}')>"

class Vocabulary(Base):
    __tablename__ = 'vocabularies'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256))
    lang_id: Mapped[int] = mapped_column(ForeignKey('langs.id'))
    notes: Mapped[list['Note']] = relationship(cascade='all, delete')
    __table_args__ = (UniqueConstraint('lang_id', 'name'),)


class NoteLevel(enum.Enum):
        A1 = 'a1'
        A2 = 'a2'
        B1 = 'b1'
        B2 = 'b2'
        C1 = 'c1'
        C2 = 'c2'

class Note(Base):
    __tablename__ = 'notes'
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(Text, default='', server_default='')
    text: Mapped[str] = mapped_column(Text, default='', server_default='')
    level: Mapped[NoteLevel] = mapped_column(SQLEnum(NoteLevel), nullable=True)
    vocabulary_id: Mapped[int] = mapped_column(ForeignKey('vocabularies.id'))
    audio_id: Mapped[int] = mapped_column(ForeignKey('resources.id'), nullable=True)
    resources: Mapped[list['Resource']] = relationship(cascade='all, delete')
    __table_args__ = (UniqueConstraint('vocabulary_id', 'title'),)


class Resource(Base):
    __tablename__ = 'resources'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(256))
    data: Mapped[bytes] = mapped_column(LargeBinary)
    note_id: Mapped[int] = mapped_column(ForeignKey('notes.id'))
