import uuid
from datetime import date
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Date, Integer, Float, Enum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ComplaintSource, Severity, Priority, ComplaintStatus, RiskLevel
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.complaint_documents import ComplaintDocument
    from app.models.complaint_audit_logs import ComplaintAuditLog
    from app.models.complaint_status_history import ComplaintStatusHistory
    from app.models.chat_messages import ChatMessage

class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_complaints_status_severity_risk", "status", "severity", "risk_level"),
        Index("ix_complaints_customer_product_batch", "customer_name", "product_name", "batch_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    customer_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    complaint_source: Mapped[ComplaintSource] = mapped_column(
        Enum(ComplaintSource, name="complaintsource"),
        index=True,
        nullable=False,
    )
    product_name: Mapped[str] = mapped_column(
        String(255),
        index=True,
        nullable=False,
    )
    strength_grade: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    batch_number: Mapped[str] = mapped_column(
        String(100),
        index=True,
        nullable=False,
    )
    manufacturing_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    expiry_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )
    quantity: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    complaint_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    complaint_description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    complaint_date: Mapped[date] = mapped_column(
        Date,
        index=True,
        nullable=False,
    )
    severity: Mapped[Severity] = mapped_column(
        Enum(Severity, name="severity"),
        default=Severity.MAJOR,
        index=True,
        nullable=False,
    )
    priority: Mapped[Priority] = mapped_column(
        Enum(Priority, name="priority"),
        default=Priority.MEDIUM,
        nullable=False,
    )
    status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"),
        default=ComplaintStatus.DRAFT,
        index=True,
        nullable=False,
    )
    risk_level: Mapped[Optional[RiskLevel]] = mapped_column(
        Enum(RiskLevel, name="risklevel"),
        default=RiskLevel.MEDIUM,
        index=True,
        nullable=True,
    )
    confidence_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    missing_fields: Mapped[dict] = mapped_column(
        JSONB,
        default=list,
        nullable=False,
    )
    ai_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    ai_metadata: Mapped[dict] = mapped_column(
        JSONB,
        default=dict,
        nullable=False,
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    updated_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    # Relationships
    created_by: Mapped["User"] = relationship(
        "User",
        foreign_keys=[created_by_id],
        back_populates="created_complaints",
    )
    updated_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[updated_by_id],
        back_populates="updated_complaints",
    )
    documents: Mapped[List["ComplaintDocument"]] = relationship(
        "ComplaintDocument",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[List["ComplaintAuditLog"]] = relationship(
        "ComplaintAuditLog",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
    status_history: Mapped[List["ComplaintStatusHistory"]] = relationship(
        "ComplaintStatusHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
    chat_messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )
