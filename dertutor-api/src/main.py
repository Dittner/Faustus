import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from src.context import dertutor_context
from src.repo import InsertDefaultRowsService
from src.routes.corpus import router as corpus_router
from src.routes.langs import router as langs_router
from src.routes.media import router as media_router
from src.routes.notes import router as notes_router
from src.routes.vocabularies import router as vocabularies_router

print('Python ver:', sys.version)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None, None]:
    # # startup
    # if not broker.is_worker_process:
    #     await broker.startup()

    # FastStream broker
    ## await broker.start()

    # async with db_helper.engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)

    await InsertDefaultRowsService.run()
    #dertutor_context.en_ru_db.connect()
    #dertutor_context.en_pron_db.connect()
    dertutor_context.de_pron_db.connect()

    yield
    # shutdown
    await dertutor_context.close_all_connections()


app = FastAPI(title='DERTUTOR API', lifespan=lifespan, default_response_class=ORJSONResponse)

app.include_router(langs_router, prefix='/api')
app.include_router(vocabularies_router, prefix='/api')
app.include_router(notes_router, prefix='/api')
app.include_router(media_router, prefix='/api')
app.include_router(corpus_router, prefix='/api')

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


@app.get('/api', summary='root', tags=['Status'])
async def root():
    return {'status': 'ready'}


# if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)
