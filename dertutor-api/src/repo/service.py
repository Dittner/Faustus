from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.context import dertutor_context
from src.repo.model import Lang, Vocabulary


class InsertDefaultRowsService:
    @classmethod
    async def run(cls):
        async with dertutor_context.session_manager.make_session() as session:
            res = await session.execute(select(Lang))
            if len(res.scalars().all()) == 0:
                await cls.create_languages(session)
                await session.commit()
                await cls.create_de_vocabularies(session)
                await cls.create_en_vocabularies(session)
                await session.commit()

    @classmethod
    async def create_languages(cls, session: AsyncSession):
        session.add(Lang(code='de', name='Deutsch'))
        session.add(Lang(code='en', name='English'))

    @classmethod
    async def create_de_vocabularies(cls, session: AsyncSession):
        q = select(Lang).where(Lang.code == 'de')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Vocabulary(lang_id=lang.id, name='Lexikon'))

    @classmethod
    async def create_en_vocabularies(cls, session: AsyncSession):
        q = select(Lang).where(Lang.code == 'en')
        res = await session.execute(q)
        lang = res.scalar_one_or_none()
        if lang:
            session.add(Vocabulary(lang_id=lang.id, name='Lexicon'))
