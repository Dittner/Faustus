from sqlalchemy import ForeignKey, Integer, MetaData, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


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
    name: Mapped[str] = mapped_column(String(255))
    vocs: Mapped[list['Voc']] = relationship(cascade='all, delete')
    tags: Mapped[list['Tag']] = relationship(cascade='all, delete')

    def __repr__(self):
        return f"<Lang(id='{self.id}', code='{self.code}')>"


class Voc(Base):
    __tablename__ = 'vocs'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    lang_id: Mapped[int] = mapped_column(ForeignKey('langs.id'))
    notes: Mapped[list['Note']] = relationship(cascade='all, delete')
    __table_args__ = (UniqueConstraint('lang_id', 'name'),)


class Tag(Base):
    __tablename__ = 'tags'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, default='', server_default='')
    lang_id: Mapped[int] = mapped_column(ForeignKey('langs.id'))
    __table_args__ = (UniqueConstraint('lang_id', 'name'),)


class Note(Base):
    __tablename__ = 'notes'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(Text, default='', server_default='')
    text: Mapped[str] = mapped_column(Text, default='', server_default='')
    lang_id: Mapped[int] = mapped_column(ForeignKey('langs.id'))
    voc_id: Mapped[int] = mapped_column(ForeignKey('vocs.id'))
    audio_url: Mapped[str] = mapped_column(String(255), default='')
    level: Mapped[int | None] = mapped_column(Integer)
    tag_id: Mapped[int | None] = mapped_column(ForeignKey('tags.id'))
    media: Mapped[list['Media']] = relationship(cascade='all, delete')
    __table_args__ = (UniqueConstraint('voc_id', 'name'),)


class Media(Base):
    __tablename__ = 'media'
    uid: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    media_type: Mapped[str] = mapped_column(String(255))
    note_id: Mapped[int] = mapped_column(ForeignKey('notes.id'))
    __table_args__ = (UniqueConstraint('note_id', 'uid'),)
