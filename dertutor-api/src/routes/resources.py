import logging
import uuid

from fastapi import APIRouter, Response, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Resource
from pathlib import Path


router = APIRouter(prefix='', tags=['Resources'])
log = logging.getLogger(__name__)


class ResourceCreate(BaseModel):
    note_id: int
    name: str
    data: bytes


class ResourceRead(BaseModel):
    id: int
    note_id: int
    name: str
    url: str


class ResourceDelete(BaseModel):
    id: int


@router.get('/resources/{resource_url:path}')
async def get_resource(resource_url:str):
    p = dertutor_context.local_store_path / resource_url
    if p.exists:
        return FileResponse(p.as_posix())
    else:
        return Response(content=f'Resource <{resource_url}> not found', status_code=status.HTTP_404_NOT_FOUND)


@router.post('/resources', response_model=ResourceRead)
async def create_resource(r: ResourceCreate):
    p = dertutor_context.local_store_path  / str(r.note_id)
    if not p.exists():
        Path.mkdir(p)

    p /= str(uuid.uuid4())
    with p.open('wb') as f:
        f.write(r.data)
    
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Resource(name=r.name, note_id=r.note_id, url=('/' + p.relative_to(dertutor_context.local_store_path).as_posix()))
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/resources', response_model=ResourceRead | None)
async def delete_resource(r: ResourceDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Resource).where(Resource.id == r.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                p = dertutor_context.local_store_path / item.url
                if p.exists():
                    log.info(f'File <{p.as_posix()}> is deleted')
                    p.unlink()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Resource not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)
