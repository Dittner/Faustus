import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError

from src.repo import repo
from src.repo.model import Vocabulary

router = APIRouter(prefix='', tags=['Vocabularies'])
log = logging.getLogger(__name__)


class VocCreate(BaseModel):
    lang_id: int
    name: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str


class VocDelete(BaseModel):
    id: int


@router.get('/languages/{lang_id}/vocabularies', response_model=list[VocRead])
async def get_vocabularies(lang_id:int):
    async with repo.make_session() as session:
        query = select(Vocabulary).where(Vocabulary.lang_id == lang_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/vocabularies', response_model=VocRead)
async def create_vocabulary(v: VocCreate):
    async with repo.make_session() as session:
        try:
            res = Vocabulary(**v.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/vocabularies', response_model=VocRead | None)
async def delete_vocabulary(v: VocDelete):
    async with repo.make_session() as session:
        try:
            query = select(Vocabulary).where(Vocabulary.id == v.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Vocabulary not found', status_code=status.HTTP_400_BAD_REQUEST)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
