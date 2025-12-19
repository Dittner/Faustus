import logging
import math
import shutil
from typing import Annotated

import sqlalchemy as sa
from fastapi import APIRouter, Query, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import event
from sqlalchemy.exc import DBAPIError
from sqlalchemy.orm import selectinload
from src.context import dertutor_context
from src.repo.model import Note

router = APIRouter(prefix='', tags=['Notes'])
log = logging.getLogger('uvicorn')


@event.listens_for(Note, 'before_delete')
def receive_before_delete(mapper, connection, target):
    if isinstance(target, Note):
        p = dertutor_context.local_store_path / 'media' / str(target.id)
        if p.exists():
            shutil.rmtree(p.absolute().as_posix())
            log.info('All MediaFiles of note with id: <%s> are deleted', p.as_posix())


class NoteCreate(BaseModel):
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None


class NoteUpdate(BaseModel):
    id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None


class NoteRename(BaseModel):
    id: int
    name: str


class NoteRead(BaseModel):
    id: int
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None

    class Config:
        orm_mode = True


class Page[T](BaseModel):
    items: list[T]
    total: int
    page: int
    pages: int
    size: int


class MediaRead(BaseModel):
    uid: str
    note_id: int
    name: str
    media_type: str


class NoteReadFull(BaseModel):
    id: int
    lang_id: int
    voc_id: int
    name: str
    text: str
    audio_url: str
    level: int | None = None
    tag_id: int | None = None
    media: list[MediaRead]


class NoteDelete(BaseModel):
    id: int


@router.post('/notes', response_model=NoteRead)
async def create_note(n: NoteCreate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Note(**n.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.get('/notes', response_model=NoteReadFull | None)
async def get_note(note_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            q = sa.select(Note).where(Note.id == note_id).options(selectinload(Note.media))
            res = await session.execute(q)
            item = res.unique().scalars().first()
            if item:
                return item
            else:
                return Response(
                    content='Note not found',
                    status_code=status.HTTP_404_NOT_FOUND,
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.put('/notes', response_model=NoteRead | None)
async def update_note(n: NoteUpdate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = sa.select(Note).where(Note.id == n.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.name = n.name
                item.text = n.text
                item.level = n.level
                item.voc_id = n.voc_id
                item.audio_url = n.audio_url
                item.tag_id = n.tag_id
                await session.commit()
                return item
            else:
                return Response(
                    content='Note not found',
                    status_code=status.HTTP_404_NOT_FOUND,
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.patch('/notes/rename', response_model=NoteRead | None)
async def rename_note(n: NoteRename):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = sa.select(Note).where(Note.id == n.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.name = n.name
                await session.commit()
                return item
            else:
                return Response(
                    content='Note not found',
                    status_code=status.HTTP_404_NOT_FOUND,
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/notes', response_model=NoteRead | None)
async def delete_note(n: NoteDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = sa.select(Note).where(Note.id == n.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(
                    content='Note not found',
                    status_code=status.HTTP_404_NOT_FOUND,
                )
        except DBAPIError as e:
            await session.rollback()
            log.warning('DBAPIError: %s', e)
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


class SearchParams(BaseModel):
    lang_id: int
    size: int = Field(50, gt=0, le=100, description='Limit of items to return (1-100)')
    page: int = Field(1, ge=1, description='Offset for pagination')
    key: str | None = Field(None, min_length=2, description='Search key')
    voc_id: int | None = Field(None, ge=1)
    level: int | None = Field(None, ge=1)
    tag_id: int | None = Field(None, ge=1)


@router.get('/notes/search')
async def search_notes(params: Annotated[SearchParams, Query()]):
    async with dertutor_context.session_manager.make_session() as session:
        count_result = await session.execute(search_query(params=params, count=True))
        total_items = count_result.scalars().one()

        select_result = await session.execute(search_query(params=params, count=False))
        items = [row._mapping for row in select_result]
        return {
            'items': items,
            'total': total_items,
            'page': params.page,
            'pages': math.ceil(total_items / params.size),
            'size': params.size,
        }


def search_query(params: SearchParams, count: bool) -> sa.TextClause:
    select_from_notes = 'SELECT * FROM notes'
    count_from_notes = 'SELECT COUNT(*) FROM notes'

    filters = f"""
        WHERE lang_id = :lang_id
        {"AND (name ILIKE '%' || :key || '%' OR text ILIKE '%' || :key || '%')" if params.key else ''}
        {'AND voc_id = :voc_id' if params.voc_id else ''}
        {'AND level = :level' if params.level else ''}
        {'AND tag_id = :tag_id' if params.tag_id else ''}
        """

    sort_and_paginate = f"""
        ORDER BY
            {
        '''
            CASE
                WHEN POSITION(:key IN name) = 1 THEN 0
                WHEN POSITION(:key IN name) > 1 THEN 1
                ELSE 2
            END ASC,
            '''
        if params.key
        else ''
    }
            level
        LIMIT :limit
        OFFSET :offset;
        """

    ss = [count_from_notes, filters] if count else [select_from_notes, filters, sort_and_paginate]

    pp = {
        'lang_id': params.lang_id,
        'key': params.key,
        'voc_id': params.voc_id,
        'level': params.level,
        'tag_id': params.tag_id,
    }

    if not count:
        pp['limit'] = params.size
        pp['offset'] = params.size * (params.page - 1)
    pp = {k: v for k, v in pp.items() if v is not None}

    return sa.text('\n'.join(ss)).bindparams(**pp)
