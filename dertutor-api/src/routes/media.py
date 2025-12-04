import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Response, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Media

router = APIRouter(prefix='', tags=['Media'])
log = logging.getLogger(__name__)


class MediaRead(BaseModel):
    uid: str
    note_id: int
    name: str
    media_type: str


class MediaDelete(BaseModel):
    uid: str


@router.get('/notes/{note_id}/media', response_model=list[MediaRead])
async def get_all_media_files(note_id: int):
    async with dertutor_context.session_manager.make_session() as session:
        query = select(Media).where(Media.note_id == note_id)
        res = await session.execute(query)
        return res.scalars().all()


@router.post('/media/uploadfile/{note_id}', response_model=MediaRead)
async def upload_file(file: UploadFile, note_id: int):
    log.info(f'Uploading to: {note_id}')
    uid = str(uuid.uuid4())
    bb = await file.read()
    # Read the entire file
    # Or, stream the file in chunks:
    # while chunk := await file.read(8192):
    # Process chunk

    p = dertutor_context.local_store_path / 'media' / str(note_id)
    if not p.exists():
        Path.mkdir(p)

    p /= uid
    with p.open('wb') as f:
        f.write(bb)

    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Media(name=file.filename, note_id=note_id, uid=uid, media_type=file.content_type)
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            if p.exists():
                p.unlink()
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.get('/media/{note_id}/{media_uid}')
async def get_media_file(note_id: int, media_uid: str):
    p = dertutor_context.local_store_path / 'media' / str(note_id) / media_uid
    if p.exists:
        return FileResponse(p.as_posix())
    else:
        return Response(
            content=f'Media <{p.relative_to(dertutor_context.local_store_path).as_posix()}> not found', status_code=status.HTTP_404_NOT_FOUND
        )

@router.delete('/media', response_model=str)
async def delete_media_file(m: MediaDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Media).where(Media.uid == m.uid)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                p = dertutor_context.local_store_path / 'media'/ str(item.note_id) / item.uid
                if p.exists():
                    log.info(f'MdeifaFile <{p.as_posix()}> is deleted')
                    p.unlink()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Media not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
