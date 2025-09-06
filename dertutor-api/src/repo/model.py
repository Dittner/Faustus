from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Lang(Base):
    __tablename__ = 'langs'
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(2), unique=True)  # en, de, ru


class Vocabulary(Base):
    __tablename__ = 'vocabularies'
    id: Mapped[int] = mapped_column(primary_key=True)
    lang_id: Mapped[int] = mapped_column(ForeignKey('langs.id'))
    name: Mapped[str] = mapped_column(String(256), unique=True)


class Note(Base):
    __tablename__ = 'notes'
    id: Mapped[int] = mapped_column(primary_key=True)
    vocabulary_id: Mapped[int] = mapped_column(ForeignKey('vocabularies.id'))
    value1: Mapped[str] = mapped_column(Text, default='', server_default='')  # title, foreign language text
    value2: Mapped[str] = mapped_column(Text, default='', server_default='')  # article, translation
    value3: Mapped[str] = mapped_column(Text, default='', server_default='')  # irregular verb forms, plural form, declension
    options: Mapped[str] = mapped_column(JSON | None)
    audio_id: Mapped[int] = mapped_column(Integer | None)
