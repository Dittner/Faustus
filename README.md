## Intro
__Faustus__ – group of apps:
+ index-web module – notes manager written with [FlinkerDom](https://github.com/Dittner/FlinkerDom) library.
+ index-api - fastapi backend, stores notes
+ dertutor-api - fastapi/Postgres/SQLAlchemy backend, stores en/de-vocabularies/lessons/tests

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
>>> docker-compose -f docker-compose-index-dev.yml up --build
```

## Run Dertutor App
```cmd
>>> docker-compose -f docker-compose-dertutor-dev.yml up --build
```

## Run pgadmin
Enter database address: 'dertutor-pg' – container name, not localhost

## Migrations
Generate migration file:
```cmd
>>> uv run alembic revision --autogenerate -m 'migration name'
```

Apply migration
```cmd
>>> uv run alembic upgrade head
```