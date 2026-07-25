import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Text, Enum, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ComplaintStatus

if TYPE_CHECKING:
    from app.models.complaints import Complaint
    from app.models.users import User

class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    complaint_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("complaints.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    from_status: Mapped[Optional[ComplaintStatus]] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"),
        nullable=True,
    )
    to_status: Mapped[ComplaintStatus] = mapped_column(
        Enum(ComplaintStatus, name="complaintstatus"),
        nullable=False,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    complaint: Mapped["Complaint"] = relationship(
        "Complaint",
        back_populates="status_history",
        lazy="joined",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="status_changes",
        lazy="joined",
    )
