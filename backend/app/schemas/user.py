from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.base import BaseSchema

class UserBase(BaseSchema):
    email: EmailStr
    role: UserRole = UserRole.QA_ANALYST

class UserCreate(UserBase):
    """
    This schema is reserved for future user onboarding and is not currently exposed through any API.
    """
    password: str = Field(..., min_length=8, max_length=100, description="Plaintext password")

class UserUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    role: Optional[UserRole] = None

class UserRead(UserBase):
    """
    Public safe user schema. Does NOT expose hashed_password, passwords, or security secrets.
    """
    id: UUID
    created_at: datetime
    updated_at: datetime

class LoginRequest(BaseSchema):
    """
    Payload required for user authentication login endpoint.
    """
    email: EmailStr
    password: str = Field(..., min_length=1, description="User password")

class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseSchema):
    sub: Optional[UUID] = None
    exp: Optional[int] = None
    role: Optional[UserRole] = None

