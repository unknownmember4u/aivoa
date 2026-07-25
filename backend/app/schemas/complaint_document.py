from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema

class ComplaintDocumentBase(BaseSchema):
    file_name: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0, description="File size in bytes")
    mime_type: str = Field(..., min_length=1, max_length=100)

class ComplaintDocumentCreate(ComplaintDocumentBase):
    file_path: str = Field(..., min_length=1, max_length=512)
    raw_extracted_text: Optional[str] = None

class ComplaintDocumentRead(ComplaintDocumentBase):
    id: UUID
    complaint_id: Optional[UUID] = None
    file_path: str
    raw_extracted_text: Optional[str] = None
    uploaded_at: datetime
