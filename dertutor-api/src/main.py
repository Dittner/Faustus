import sys
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from src.repo import InsertDefaultRowsService, repo
from src.routes.langs import router as langs_router
from src.routes.vocabularies import router as vocabularies_router
from src.routes.notes import router as notes_router

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

    yield
    # shutdown
    await repo.dispose()


app = FastAPI(
    # default_response_class=ORJSONResponse,
    lifespan=lifespan,
    default_response_class=ORJSONResponse,
)
app.include_router(langs_router, prefix='/api')
app.include_router(vocabularies_router, prefix='/api')
app.include_router(notes_router, prefix='/api')

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])


@app.get('/api', summary='root', tags=['Status'])
async def root():
    return {'status': 'ready'}


# if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)
