import logging
import os

from pydantic import BaseModel
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

db_url = os.getenv('DB_URL')
if not db_url:
    db_url = 'postgresql+asyncpg://postgres:postgres@localhost:5432/postgres'
    logger.warning(f'DB_URL env is None! The default one will be used: {db_url}')


class DatabaseConfig(BaseModel):
    url: str = db_url
    echo: bool = False
    echo_pool: bool = False
    pool_size: int = 20
    max_overflow: int = 10


class Settings(BaseSettings):
    db: DatabaseConfig = DatabaseConfig()


settings = Settings()
