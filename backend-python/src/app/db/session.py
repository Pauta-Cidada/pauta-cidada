"""Database session configuration for async PostgreSQL with SQLAlchemy"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import Config
import os

config = Config()

# Create async engine
engine = create_async_engine(
    os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/pauta_cidada"),
    echo=True,  # Log SQL queries (disable in production)
    future=True,
    pool_pre_ping=True,  # Verify connections before using
)

# Session factory
async_session_maker = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)


async def get_db():
    """Dependency injection for FastAPI routes"""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
