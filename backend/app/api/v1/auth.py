from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.user import LoginRequest, UserRead
from app.services.auth_service import login

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=Dict[str, Any])
async def login_user(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticates user with email and password, returning JWT access token and user profile.
    """
    return await login(db, login_data)

@router.get("/me", response_model=UserRead)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns the currently authenticated user's profile information.
    """
    return current_user
