from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from pydantic import Field

from app.schemas.base import BaseSchema

T = TypeVar("T")

class PaginationParams(BaseSchema):
    """
    Standard pagination query parameters.
    """
    page: int = Field(1, ge=1, description="Page number starting from 1")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")

class PaginatedResponse(BaseSchema, Generic[T]):
    """
    Standard paginated container response.
    """
    items: List[T]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1)
    total_pages: int = Field(..., ge=0)

class APIResponse(BaseSchema, Generic[T]):
    """
    Standard top-level API success response envelope.
    """
    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None

class ErrorDetail(BaseSchema):
    code: str
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseSchema):
    """
    Standard error response payload.
    """
    success: bool = False
    error: ErrorDetail
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthResponse(BaseSchema):
    """
    Health check endpoint payload schema.
    """
    status: str
    version: str
    environment: str
    database: str
