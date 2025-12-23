import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse
from src.context import dertutor_context
from src.repo import InsertDefaultRowsService
from src.routes.corpus import router as corpus_router
from src.routes.langs import router as langs_router
from src.routes.media import router as media_router
from src.routes.notes import router as notes_router
from src.routes.tags import router as tags_router
from src.routes.vocs import router as voc_router

print('Python ver:', sys.version)
log = logging.getLogger('uvicorn')


@asynccontextmanager
async def lifespan(_: FastAPI):
    # # startup
    # if not broker.is_worker_process:
    #     await broker.startup()

    # FastStream broker
    ## await broker.start()

    # async with db_helper.engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)

    await InsertDefaultRowsService.run()

    if os.getenv('CONNECT_EN_RU_PRON_DB') == 'true':
        dertutor_context.en_ru_db.connect()
    if os.getenv('CONNECT_EN_PRON_DB') == 'true':
        dertutor_context.en_pron_db.connect()
    if os.getenv('CONNECT_DE_PRON_DB') == 'true':
        dertutor_context.de_pron_db.connect()

    yield
    # shutdown
    await dertutor_context.close_all_connections()


app = FastAPI(title='DERTUTOR API', lifespan=lifespan, default_response_class=ORJSONResponse)

app.include_router(langs_router, prefix='/api')
app.include_router(voc_router, prefix='/api')
app.include_router(notes_router, prefix='/api')
app.include_router(media_router, prefix='/api')
app.include_router(corpus_router, prefix='/api')
app.include_router(tags_router, prefix='/api')

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = str(exc).replace('\n', ' ').replace('   ', ' ')
    log.error('%s: %s', request, exc_str)
    content = {'status_code': 10422, 'message': exc_str, 'data': None}
    return JSONResponse(content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)


@app.get('/api', summary='root', tags=['Status'])
async def root():
    return {'status': 'ready'}


# if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)
