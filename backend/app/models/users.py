import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.complaints import Complaint
    from app.models.complaint_audit_logs import ComplaintAuditLog
    from app.models.complaint_status_history import ComplaintStatusHistory
    from app.models.chat_messages import ChatMessage

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"),
        default=UserRole.QA_ANALYST,
        nullable=False,
    )

    # Relationships
    created_complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        foreign_keys="Complaint.created_by_id",
        back_populates="created_by",
    )
    updated_complaints: Mapped[List["Complaint"]] = relationship(
        "Complaint",
        foreign_keys="Complaint.updated_by_id",
        back_populates="updated_by",
    )
    audit_logs: Mapped[List["ComplaintAuditLog"]] = relationship(
        "ComplaintAuditLog",
        back_populates="user",
    )
    status_changes: Mapped[List["ComplaintStatusHistory"]] = relationship(
        "ComplaintStatusHistory",
        back_populates="user",
    )
    chat_messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="user",
    )
