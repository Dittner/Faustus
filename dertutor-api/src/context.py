import logging
import os
from pathlib import Path

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from src.core.database import JsonFileDB, KeyValueDB

logger = logging.getLogger(__name__)


class SessionManager:
    def __init__(self) -> None:
        self.postgres_db_url = (
            os.getenv('POSTGRES_DB_URL')
            or 'postgresql+asyncpg://postgres:postgres@localhost:5432/postgres'
        )

        if not os.getenv('POSTGRES_DB_URL'):
            logger.warning(
                'POSTGRES_DB_URL env is None! The default one will be used: %s',
                self.postgres_db_url,
            )

        self.engine: AsyncEngine = create_async_engine(
            url=self.postgres_db_url,
            echo=False,
            echo_pool=False,
            pool_size=20,
            max_overflow=10,
        )
        self.session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    async def dispose(self) -> None:
        await self.engine.dispose()
        print('Database engine disposed')

    def make_session(self):
        return self.session_factory()
        # async with self.session_factory() as session:
        #     yield session


class DerTutorContext:
    def __init__(self) -> None:
        self.session_manager = SessionManager()

        self.local_store_path = Path('data')
        if not self.local_store_path.exists():
            Path.mkdir(self.local_store_path)

        self.en_pron_db = KeyValueDB(db_path=Path('data/pron/en_pron.bin'))
        self.de_pron_db = KeyValueDB(db_path=Path('data/pron/de_pron.bin'))
        self.en_ru_db = JsonFileDB(db_path=Path('data/json/en_ru.json'))

    async def close_all_connections(self):
        self.en_pron_db.close()
        self.de_pron_db.close()
        self.en_ru_db.close()
        await self.session_manager.dispose()


dertutor_context = DerTutorContext()
