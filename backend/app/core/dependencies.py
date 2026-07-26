import logging
import time
from typing import Callable
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.users import User
from app.services.auth_service import get_user_by_id

logger = logging.getLogger("backend_timing_audit")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Validates JWT token from Bearer Header and retrieves the current authenticated User.
    """
    t0 = time.perf_counter()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        t_jwt_start = time.perf_counter()
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = UUID(user_id_str)
        t_jwt_dur = round((time.perf_counter() - t_jwt_start) * 1000, 3)
    except (JWTError, ValueError):
        raise credentials_exception

    t_db_start = time.perf_counter()
    user = await get_user_by_id(db, user_id=user_id)
    t_db_dur = round((time.perf_counter() - t_db_start) * 1000, 3)

    if user is None:
        raise credentials_exception

    total_dep_dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(
        f"[TIMING DEPENDENCY auth] JWT Decode: {t_jwt_dur}ms | User DB Lookup: {t_db_dur}ms | Total Auth Dependency: {total_dep_dur}ms"
    )
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensures current authenticated user is active.
    """
    return current_user

def require_roles(*allowed_roles: UserRole) -> Callable:
    """
    Dependency factory enforcing Role-Based Access Control (RBAC).
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for your user role",
            )
        return current_user

    return role_checker
