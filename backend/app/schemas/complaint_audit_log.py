from datetime import datetime
from typing import Any, Dict
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema

class ComplaintAuditLogBase(BaseSchema):
    action: str = Field(..., min_length=1, max_length=50)
    changed_fields: Dict[str, Any] = Field(default_factory=dict)

class ComplaintAuditLogCreate(ComplaintAuditLogBase):
    complaint_id: UUID
    user_id: UUID

class ComplaintAuditLogRead(ComplaintAuditLogBase):
    id: UUID
    complaint_id: UUID
    user_id: UUID
    timestamp: datetime
