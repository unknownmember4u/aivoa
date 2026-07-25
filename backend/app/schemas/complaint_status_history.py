from datetime import datetime
from typing import Optional
from uuid import UUID

from app.models.enums import ComplaintStatus
from app.schemas.base import BaseSchema

class ComplaintStatusHistoryBase(BaseSchema):
    from_status: Optional[ComplaintStatus] = None
    to_status: ComplaintStatus
    notes: Optional[str] = None

class ComplaintStatusHistoryCreate(ComplaintStatusHistoryBase):
    complaint_id: UUID
    user_id: UUID

class ComplaintStatusHistoryRead(ComplaintStatusHistoryBase):
    id: UUID
    complaint_id: UUID
    user_id: UUID
    changed_at: datetime
