import asyncio
from app.db.database import AsyncSessionLocal, engine
from app.db.base import Base
from app.models.users import User
from app.models.enums import UserRole
from app.core.security import get_password_hash

async def seed_data():
    print("Seeding database...")
    async with AsyncSessionLocal() as session:
        # Create tables if they do not exist
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Check if default user exists
        from sqlalchemy import select
        stmt = select(User).where(User.email == "qa.analyst@pharma.com")
        result = await session.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            default_user = User(
                email="qa.analyst@pharma.com",
                hashed_password=get_password_hash("password"),
                role=UserRole.QA_ANALYST,
            )
            session.add(default_user)
            await session.commit()
            print("Default QA Analyst user seeded successfully!")
            print("Email: qa.analyst@pharma.com")
            print("Password: password")
        else:
            print("Default QA Analyst user already exists in database.")

if __name__ == "__main__":
    asyncio.run(seed_data())
