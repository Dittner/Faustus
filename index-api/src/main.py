import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.index.routes import router as index_router

print('Python ver:', sys.version)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

app.include_router(index_router, prefix='/api')


@app.get('/api', summary='root', tags=['Root rout'])
async def root():
    return {'status': 'ready'}


# >>> uv run uvicorn "src.main:app" --host "127.0.0.1" --port "3456" --reload
#
# if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)
