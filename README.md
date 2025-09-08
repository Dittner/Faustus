## Intro
__Faustus__ – group of apps:
+ index-web module – notes manager written with [FlinkerDom](https://github.com/Dittner/FlinkerDom) library.
+ index-api - fastapi backend, stores notes
+ dertutor-api - fastapi/Postgres/SQLAlchemy backend, stores en/de-vocabularies/lessons/tests

## License
MIT

## Build Docker Image
```cmd
$ docker-compose -f docker-compose-dev.yml up --build
```