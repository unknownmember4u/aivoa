import asyncio
import time
from sqlalchemy import text
from app.db.database import AsyncSessionLocal

async def main():
    print("Testing SQLAlchemy Connection Pool...")
    t0 = time.time()
    async with AsyncSessionLocal() as session:
        t1 = time.time()
        print(f"Session acquired in {t1 - t0:.3f}s")
        result = await session.execute(text("SELECT 1"))
        t2 = time.time()
        print(f"Query executed in {t2 - t1:.3f}s")
        print(result.scalar_one())

asyncio.run(main())
