import logging
import shutil
from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Note

router = APIRouter(prefix='', tags=['Notes'])
log = logging.getLogger(__name__)


class NoteCreate(BaseModel):
    title: str
    text: str
    level: int
    vocabulary_id: int
    audio_url: str


class NoteUpdate(BaseModel):
    title: str
    text: str
    level: int
    vocabulary_id: int
    audio_url: str


class NoteRename(BaseModel):
    title: str


class NoteRead(BaseModel):
    id: int
    title: str
    text: str
    level: int
    vocabulary_id: int
    audio_url: str


class NoteDelete(BaseModel):
    id: int


@router.get('/vocabularies/{voc_id}/notes', response_model=list[NoteRead])
async def get_notes(voc_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        query = select(Note).where(Note.vocabulary_id == voc_id)
        res = await session.execute(query)
        return res.scalars().all()


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
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.put('/notes/{note_id}', response_model=NoteRead | None)
async def update_note(n: NoteUpdate, note_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Note).where(Note.id == note_id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.title = n.title
                item.text = n.text
                item.level = n.level
                item.audio_url = n.audio_url
                await session.commit()
                return item
            else:
                return Response(content='Note not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
        
@router.patch('/notes/{note_id}/rename', response_model=NoteRead | None)
async def rename_note(n: NoteRename, note_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Note).where(Note.id == note_id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                item.title = n.title
                await session.commit()
                return item
            else:
                return Response(content='Note not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/notes', response_model=NoteRead | None)
async def delete_note(n: NoteDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Note).where(Note.id == n.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                p = dertutor_context.local_store_path / 'media'/ str(n.id)
                if p.exists():
                    log.info(f'All MediaFiles of note with id: <{p.as_posix()}> are deleted')
                    shutil.rmtree(p.absolute().as_posix())
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Note not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
