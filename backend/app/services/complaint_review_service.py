from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.complaints import Complaint
from app.models.complaint_documents import ComplaintDocument
from app.models.complaint_audit_logs import ComplaintAuditLog
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.enums import ComplaintStatus
from app.models.users import User
from app.repositories import complaint_repository
from app.schemas.complaint import ComplaintCreate, ComplaintRead

async def submit_reviewed_complaint(
    db: AsyncSession,
    complaint_in: ComplaintCreate,
    current_user: User,
    document_id: Optional[UUID] = None,
) -> ComplaintRead:
    """
    Finalizes and submits a user-reviewed complaint form.
    Persists the complaint record with status=SUBMITTED, links uploaded documents,
    and writes audit log and status history entries.
    """
    # 1. Prepare complaint database entity
    complaint_data = complaint_in.model_dump()
    complaint = Complaint(
        **complaint_data,
        created_by_id=current_user.id,
        status=ComplaintStatus.SUBMITTED,
    )

    # 2. Persist complaint
    saved_complaint = await complaint_repository.create(db, complaint)

    # 3. Link uploaded document if document_id is provided
    if document_id:
        stmt = select(ComplaintDocument).where(ComplaintDocument.id == document_id)
        res = await db.execute(stmt)
        doc = res.scalar_one_or_none()
        if doc:
            doc.complaint_id = saved_complaint.id
            db.add(doc)

    # 4. Create submission audit log entry
    audit_log = ComplaintAuditLog(
        complaint_id=saved_complaint.id,
        user_id=current_user.id,
        action="SUBMITTED",
        changed_fields=complaint_in.model_dump(mode="json"),
    )
    await complaint_repository.create_audit_log(db, audit_log)

    # 5. Create initial status history entry
    status_history = ComplaintStatusHistory(
        complaint_id=saved_complaint.id,
        user_id=current_user.id,
        from_status=None,
        to_status=ComplaintStatus.SUBMITTED,
        notes="Human-in-the-loop reviewed complaint submission",
    )
    await complaint_repository.create_status_history(db, status_history)

    # 6. Commit transaction
    await db.commit()
    await db.refresh(saved_complaint)

    return ComplaintRead.model_validate(saved_complaint)
