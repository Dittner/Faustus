import uvicorn
from fastapi import FastAPI
from src.index.routes import router as index_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(CORSMiddleware,
                   allow_origins=['*'],
                   allow_methods=['*'],
                   allow_headers=['*'])

app.include_router(index_router, prefix='/api/index')


@app.get("/api", summary='root', tags=['Root rout'])
async def root():
    return {"app": "indexapi"}


#if __name__ == "__main__":
#    uvicorn.run("main:app", host="127.0.0.1", port=3456, reload=True)

