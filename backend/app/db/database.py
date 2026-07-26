from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings

# Optimized SQLAlchemy 2.0 async engine with high-concurrency connection pooling & caching
engine = create_async_engine(
    settings.sqlalchemy_database_uri,
    echo=False,
    future=True,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
    pool_timeout=10.0,
    pool_recycle=1800,
    connect_args={
        "command_timeout": 5,
        "statement_cache_size": 1000,
        "prepared_statement_cache_size": 1000,
    },
)

# Async session factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)
