import logging
from urllib.parse import unquote

from fastapi import APIRouter, Response, status
from pydantic import BaseModel
from src.context import dertutor_context

router = APIRouter(prefix='', tags=['Corpus'])
log = logging.getLogger('uvicorn')


@router.head('/corpus/de_pron/search')
async def check_de_audio_file(key: str):
    decoded_key = unquote(key)
    if dertutor_context.de_pron_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        return Response(
            content=f'Audio <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )


@router.get('/corpus/de_pron/search')
async def get_de_audio_file(key: str):
    decoded_key = unquote(key)
    bb = dertutor_context.de_pron_db.read(decoded_key)
    if bb:
        return Response(content=bb, media_type='audio/mpeg')
    else:
        return Response(
            content=f'Audio <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )


@router.head('/corpus/en_pron/search')
async def check_en_audio_file(key: str):
    decoded_key = unquote(key)
    if dertutor_context.en_pron_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        return Response(
            content=f'Audio <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )


@router.get('/corpus/en_pron/search')
async def get_en_audio_file(key: str):
    decoded_key = unquote(key)
    bb = dertutor_context.en_pron_db.read(decoded_key)
    if bb:
        return Response(content=bb, media_type='audio/mpeg')
    else:
        return Response(
            content=f'Audio <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )


@router.head('/corpus/en_ru/search')
async def check_translation(key: str):
    decoded_key = unquote(key)
    if dertutor_context.en_ru_db.has(decoded_key):
        return Response(status_code=status.HTTP_200_OK)
    else:
        return Response(
            content=f'Audio <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )


class EnRuExample(BaseModel):
    en: str
    ru: str


class EnRuResponse(BaseModel):
    key: str
    description: str
    examples: list[EnRuExample]


@router.get('/corpus/en_ru/search', response_model=EnRuResponse)
async def get_translation(key: str):
    decoded_key = unquote(key)
    item = dertutor_context.en_ru_db.read(decoded_key)
    if item:
        return item
    else:
        return Response(
            content=f'Translation of <{decoded_key}> not found',
            status_code=status.HTTP_404_NOT_FOUND,
            media_type='text/html',
        )
