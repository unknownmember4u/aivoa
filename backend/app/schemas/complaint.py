from datetime import date, datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import Field

from app.models.enums import ComplaintSource, Severity, Priority, ComplaintStatus, RiskLevel
from app.schemas.base import BaseSchema
from app.schemas.complaint_document import ComplaintDocumentRead

class ComplaintBase(BaseSchema):
    customer_name: str = Field(..., min_length=1, max_length=255)
    complaint_source: ComplaintSource
    product_name: str = Field(..., min_length=1, max_length=255)
    strength_grade: Optional[str] = Field(None, max_length=100)
    batch_number: str = Field(..., min_length=1, max_length=100)
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = Field(None, ge=0)
    complaint_type: str = Field(..., min_length=1, max_length=100)
    complaint_description: str = Field(..., min_length=1)
    complaint_date: date
    severity: Severity = Severity.MAJOR
    priority: Priority = Priority.MEDIUM

class ComplaintCreate(ComplaintBase):
    risk_level: Optional[RiskLevel] = RiskLevel.MEDIUM
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    missing_fields: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    ai_metadata: Dict[str, Any] = Field(default_factory=dict)

class ComplaintUpdate(BaseSchema):
    customer_name: Optional[str] = Field(None, min_length=1, max_length=255)
    complaint_source: Optional[ComplaintSource] = None
    product_name: Optional[str] = Field(None, min_length=1, max_length=255)
    strength_grade: Optional[str] = Field(None, max_length=100)
    batch_number: Optional[str] = Field(None, min_length=1, max_length=100)
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    quantity: Optional[int] = Field(None, ge=0)
    complaint_type: Optional[str] = Field(None, min_length=1, max_length=100)
    complaint_description: Optional[str] = Field(None, min_length=1)
    complaint_date: Optional[date] = None
    severity: Optional[Severity] = None
    priority: Optional[Priority] = None
    status: Optional[ComplaintStatus] = None
    risk_level: Optional[RiskLevel] = None
    ai_summary: Optional[str] = None

class ComplaintRead(ComplaintBase):
    id: UUID
    status: ComplaintStatus
    risk_level: Optional[RiskLevel] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    missing_fields: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    ai_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_by_id: UUID
    updated_by_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

class ComplaintListItem(BaseSchema):
    id: UUID
    customer_name: str
    product_name: str
    batch_number: str
    complaint_type: str
    severity: Severity
    priority: Priority
    status: ComplaintStatus
    risk_level: Optional[RiskLevel] = None
    complaint_date: date
    created_at: datetime

class ComplaintResponse(ComplaintRead):
    documents: List[ComplaintDocumentRead] = Field(default_factory=list)

class ComplaintUploadResponse(BaseSchema):
    extracted_data: Dict[str, Any]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    missing_fields: List[str] = Field(default_factory=list)
    ai_summary: Optional[str] = None
    risk_level: Optional[RiskLevel] = None
