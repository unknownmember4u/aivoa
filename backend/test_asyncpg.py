import asyncio
import asyncpg
import time
from app.config.settings import settings

async def main():
    print(f"Connecting to {settings.sqlalchemy_database_uri}")
    t0 = time.time()
    conn = await asyncpg.connect(user=settings.POSTGRES_USER, password=settings.POSTGRES_PASSWORD, database=settings.POSTGRES_DB, host=settings.POSTGRES_SERVER)
    t1 = time.time()
    print(f"Connected in {t1 - t0:.3f}s")
    await conn.execute("SELECT 1")
    t2 = time.time()
    print(f"Query in {t2 - t1:.3f}s")
    await conn.close()

asyncio.run(main())
