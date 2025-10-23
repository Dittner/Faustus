from fastapi import APIRouter, Response, status

from src.index.db import ClientError, MarkdownDB
from src.index.schemas import TextFileRenameSchema, TextFileSchema

router = APIRouter()
db = MarkdownDB()


@router.get('/')
def index_root():
    return {'result': 'index api is ready!'}


@router.get('/file/tree')
def get_files_tree():
    return db.get_files_tree()

# ---------------
#     file
# ---------------

@router.get('/file/{src:path}')
def read_file(src: str):
    print(f'API::read_file, src: {src}')
    try:
        return db.read_file(src)
    except FileNotFoundError as e:
        return Response(content=str(e), status_code=status.HTTP_404_NOT_FOUND)


@router.post('/file/mk/{src:path}')
def create_file(file: TextFileSchema, src: str):
    print(f'API::creating file, src: {src}')
    try:
        return db.create_file(src, file.alias, file.text)
    except ClientError as e:
        return Response(content=str(e), status_code=400)


@router.post('/file/rw/{src:path}')
def rewrite_file(file: TextFileSchema, src: str):
    print(f'API::rewrite_file, src: {src}')
    try:
        return db.rewrite_file(src, file.alias, file.text)
    except ClientError as e:
        return Response(content=str(e), status_code=400)
    except FileNotFoundError as e:
        return Response(content=str(e), status_code=status.HTTP_404_NOT_FOUND)


@router.post('/file/rn')
def rename_file(s: TextFileRenameSchema):
    print(f'API::rename_file, from: {s.from_src}, to: {s.to_src}')
    try:
        return db.rename_file(s.from_src, s.to_src)
    except ClientError as e:
        return Response(content=str(e), status_code=400)
    except FileNotFoundError as e:
        return Response(content=str(e), status_code=status.HTTP_404_NOT_FOUND)


@router.post('/file/rm/{src:path}')
def delete_file(src: str):
    print(f'API::delete_file, src: {src}')
    try:
        return db.delete_file(src)
    except ClientError as e:
        return Response(content=str(e), status_code=400)
    except FileNotFoundError as e:
        return Response(content=str(e), status_code=status.HTTP_404_NOT_FOUND)


# ---------------
#     voc
# ---------------

@router.get('/voc/alias')
def get_file_alias_voc():
    return db.file_alias_voc


# ---------------
#     ASSETS
# ---------------

@router.get('/asset/{src:path}')
def get_image(src: str):
    print(f'API:get_image, src {src}')
    try:
        return db.get_asset(src)
    except FileNotFoundError as e:
        return Response(content=str(e), status_code=status.HTTP_404_NOT_FOUND)
