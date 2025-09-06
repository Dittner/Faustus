from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.repo import db_helper


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # # startup
    # if not broker.is_worker_process:
    #     await broker.startup()

    # FastStream broker
    ## await broker.start()

    yield
    # shutdown
    await db_helper.dispose()


app = FastAPI(
    # default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])



# if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)
