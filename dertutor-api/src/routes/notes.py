import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError

from src.repo import repo
from src.repo.model import Note, Vocabulary

router = APIRouter(prefix='', tags=['Notes'])
log = logging.getLogger(__name__)


class NoteCreate(BaseModel):
    title: str
    text: str
    vocabulary_id: int
    vocabulary_group: str
    audio_id: int | None


class NoteRead(BaseModel):
    id: int
    title: str
    text: str
    vocabulary_id: int
    vocabulary_group: str
    audio_id: int | None


class NoteDelete(BaseModel):
    id: int


@router.get('/vocabularies/{voc_id}/notes', response_model=list[NoteRead])
async def get_notes(voc_id: int):
    async with repo.make_session() as session:
        query = select(Note).where(Note.vocabulary_id == voc_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/vocabularies/{voc_id}/notes', response_model=NoteRead)
async def create_note(n: NoteCreate, voc_id: int):
    async with repo.make_session() as session:
        try:
            res = Note(**n.model_dump(), vocabulary_id = voc_id)
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/notes', response_model=NoteRead | None)
async def delete_note(n: NoteDelete):
    async with repo.make_session() as session:
        try:
            query = select(Vocabulary).where(Note.id == n.id)
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
