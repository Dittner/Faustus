## Intro
__Faustus__ – markdown editor and a knowledge base with a local file storage.

## License
MIT

## Run Index App
```cmd
>>> cd Projects/Faustus/index-api
>>> uv run uvicorn "src.main:app" --host "127.0.0.1" --port "3456" --reload

>>> cd Projects/Faustus/index-web
>>> nm run dev
```

or using docker

```cmd
>>> docker-compose -f docker-compose-dev.yml up --build
```