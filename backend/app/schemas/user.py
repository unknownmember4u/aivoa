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
    password: str = Field(..., min_length=8, max_length=100, description="Plaintext password")

class UserUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)
    role: Optional[UserRole] = None

class UserRead(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class Token(BaseSchema):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseSchema):
    sub: Optional[UUID] = None
    role: Optional[UserRole] = None
