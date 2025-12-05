import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Vocabulary

router = APIRouter(prefix='', tags=['Vocabularies'])
log = logging.getLogger('uvicorn')


class VocCreate(BaseModel):
    lang_id: int
    name: str


class VocRename(BaseModel):
    name: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str


class VocDelete(BaseModel):
    id: int


@router.get('/languages/{lang_id}/vocabularies', response_model=list[VocRead])
async def get_vocabularies(lang_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        query = select(Vocabulary).where(Vocabulary.lang_id == lang_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/vocabularies', response_model=VocRead)
async def create_vocabulary(v: VocCreate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Vocabulary(**v.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.patch('/vocabularies/{voc_id}/rename', response_model=VocRead | None)
async def rename_vocabulary(v: VocRename, voc_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Vocabulary).where(Vocabulary.id == voc_id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.name = v.name
                await session.commit()
                return item
            else:
                return Response(content='Vocabulary not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/vocabularies', response_model=VocRead | None)
async def delete_vocabulary(v: VocDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Vocabulary).where(Vocabulary.id == v.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Vocabulary not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
