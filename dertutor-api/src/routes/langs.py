import logging

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import DBAPIError
from src.context import dertutor_context
from src.repo.model import Lang

router = APIRouter(prefix='', tags=['Languages'])
log = logging.getLogger(__name__)


class LangCreate(BaseModel):
    code: str
    name: str


class LangRead(BaseModel):
    id: int
    code: str
    name: str


class LangDelete(BaseModel):
    id: int


@router.get('/languages', response_model=list[LangRead])
async def get_languages():
    async with dertutor_context.session_manager.make_session() as session:
        res = await session.execute(select(Lang))
        langs = res.scalars().all()
        print(langs)
        return langs


@router.post('/languages', response_model=LangRead)
async def create_language(lang: LangCreate):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            res = Lang(**lang.model_dump())
            session.add(res)
            await session.commit()
            return res
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_400_BAD_REQUEST)


@router.delete('/languages', response_model=LangRead | None)
async def delete_language(lang: LangDelete):
    async with dertutor_context.session_manager.make_session() as session:
        try:
            query = select(Lang).where(Lang.id == lang.id)
            res = await session.execute(query)
            item = res.scalars().first()
            if item:
                await session.delete(item)
                await session.commit()
                return Response(content='deleted', status_code=status.HTTP_200_OK)
            else:
                return Response(content='Language not found', status_code=status.HTTP_404_NOT_FOUND)
        except DBAPIError as e:
            await session.rollback()  # Rollback the session to clear the failed transaction
            log.warning(f'DBAPIError: {e}')
            return Response(content=str(e.orig), status_code=status.HTTP_404_NOT_FOUND)


# class UserSchema(BaseModel):
#     email: EmailStr
#     bio: str | None = Field(max_length=1000)
#     age: int = Field(ge=0, le=130)
#     model_config = ConfigDict(extra='forbid')


# user = UserSchema(email='aba@mail.com', bio=None, age=12)
