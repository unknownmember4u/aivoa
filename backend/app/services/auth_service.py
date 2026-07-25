from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, verify_password
from app.models.users import User
from app.schemas.user import LoginRequest, Token, UserRead

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Retrieves a user entity by email address.
    """
    stmt = select(User).where(User.email == email.strip().lower())
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    """
    Retrieves a user entity by UUID primary key.
    """
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    Verifies user credentials against stored hash.
    """
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def login(db: AsyncSession, login_data: LoginRequest) -> dict:
    """
    Authenticates user and returns JWT token alongside safe UserRead profile.
    """
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    return {
        "token": Token(access_token=access_token, token_type="bearer"),
        "user": UserRead.model_validate(user),
    }
