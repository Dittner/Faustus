import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Voc

router = APIRouter(prefix='', tags=['Vocs'])
log = logging.getLogger('uvicorn')


class VocCreate(BaseModel):
    lang_id: int
    name: str


class VocRename(BaseModel):
    id: int
    name: str


class VocRead(BaseModel):
    id: int
    lang_id: int
    name: str


class VocDelete(BaseModel):
    id: int


@router.get('/vocs', response_model=list[VocRead])
async def get_vocs(lang_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        query = select(Voc).where(Voc.lang_id == lang_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/vocs', response_model=VocRead)
async def create_voc(v: VocCreate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Voc(**v.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.patch('/vocs/rename', response_model=VocRead | None)
async def rename_voc(v: VocRename):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Voc).where(Voc.id == v.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.name = v.name
                await session.commit()
                return item
            else:
                return Response(
                    content='Vocabulary not found', status_code=status.HTTP_404_NOT_FOUND
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/vocs', response_model=VocRead | None)
async def delete_voc(v: VocDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Voc).where(Voc.id == v.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(
                    content='Vocabulary not found', status_code=status.HTTP_404_NOT_FOUND
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
