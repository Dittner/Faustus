import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Tag

router = APIRouter(prefix='', tags=['Tags'])
log = logging.getLogger('uvicorn')


class TagCreate(BaseModel):
    lang_id: int
    name: str


class TagRename(BaseModel):
    name: str


class TagRead(BaseModel):
    id: int
    lang_id: int
    name: str


class TagDelete(BaseModel):
    id: int


@router.get('/tags', response_model=list[TagRead])
async def get_tags(lang_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        query = select(Tag).where(Tag.lang_id == lang_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/tags', response_model=TagRead)
async def create_tag(t: TagCreate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Tag(**t.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.patch('/tags/{tag_id}/rename', response_model=TagRead | None)
async def rename_tag(t: TagRename, tag_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Tag).where(Tag.id == tag_id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.name = t.name
                await session.commit()
                return item
            else:
                return Response(content='Tag not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/tags', response_model=TagRead | None)
async def delete_tag(t: TagDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Tag).where(Tag.id == t.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Tag not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
