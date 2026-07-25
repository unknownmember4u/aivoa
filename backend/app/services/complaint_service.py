import math
from typing import Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaints import Complaint
from app.models.complaint_audit_logs import ComplaintAuditLog
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.enums import ComplaintStatus, Severity, RiskLevel
from app.models.users import User
from app.repositories import complaint_repository
from app.schemas.common import PaginatedResponse
from app.schemas.complaint import ComplaintCreate, ComplaintListItem, ComplaintRead, ComplaintResponse, ComplaintUpdate

async def create_complaint(
    db: AsyncSession,
    complaint_in: ComplaintCreate,
    current_user: User,
) -> ComplaintRead:
    """
    Creates a new complaint, logs initial audit entry, and records starting status history.
    """
    complaint_data = complaint_in.model_dump()
    complaint = Complaint(
        **complaint_data,
        created_by_id=current_user.id,
        status=ComplaintStatus.DRAFT,
    )
    
    saved_complaint = await complaint_repository.create(db, complaint)

    # Log audit entry
    audit_log = ComplaintAuditLog(
        complaint_id=saved_complaint.id,
        user_id=current_user.id,
        action="CREATED",
        changed_fields=complaint_in.model_dump(mode="json"),
    )
    await complaint_repository.create_audit_log(db, audit_log)

    # Record initial status history
    status_history = ComplaintStatusHistory(
        complaint_id=saved_complaint.id,
        user_id=current_user.id,
        from_status=None,
        to_status=saved_complaint.status,
        notes="Initial complaint intake registration",
    )
    await complaint_repository.create_status_history(db, status_history)

    await db.commit()
    await db.refresh(saved_complaint)
    return ComplaintRead.model_validate(saved_complaint)

async def get_complaint(db: AsyncSession, complaint_id: UUID) -> ComplaintResponse:
    """
    Fetches a complaint by ID with all associated document metadata and chat context.
    """
    complaint = await complaint_repository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found",
        )
    return ComplaintResponse.model_validate(complaint)

async def list_complaints(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[ComplaintStatus] = None,
    severity: Optional[Severity] = None,
    risk_level: Optional[RiskLevel] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> PaginatedResponse[ComplaintListItem]:
    """
    Retrieves a paginated list of complaints with filtering, search, and sorting.
    """
    skip = (page - 1) * page_size
    items, total = await complaint_repository.get_all(
        db,
        skip=skip,
        limit=page_size,
        status=status_filter,
        severity=severity,
        risk_level=risk_level,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    complaint_items = [ComplaintListItem.model_validate(item) for item in items]

    return PaginatedResponse[ComplaintListItem](
        items=complaint_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )

async def update_complaint(
    db: AsyncSession,
    complaint_id: UUID,
    complaint_in: ComplaintUpdate,
    current_user: User,
) -> ComplaintRead:
    """
    Updates an existing complaint record, tracking field diffs in audit logs and status changes.
    """
    complaint = await complaint_repository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found",
        )

    update_data = complaint_in.model_dump(exclude_unset=True)
    if not update_data:
        return ComplaintRead.model_validate(complaint)

    diff = {}
    old_status = complaint.status

    for field, new_val in update_data.items():
        old_val = getattr(complaint, field)
        if old_val != new_val:
            diff[field] = {
                "old": str(old_val) if old_val is not None else None,
                "new": str(new_val) if new_val is not None else None,
            }

    if diff:
        update_data["updated_by_id"] = current_user.id
        updated_complaint = await complaint_repository.update(db, complaint, update_data)

        # Audit log creation for updates
        audit_log = ComplaintAuditLog(
            complaint_id=complaint_id,
            user_id=current_user.id,
            action="UPDATED",
            changed_fields=diff,
        )
        await complaint_repository.create_audit_log(db, audit_log)

        # If status changed, create status history record
        if "status" in update_data and update_data["status"] != old_status:
            status_history = ComplaintStatusHistory(
                complaint_id=complaint_id,
                user_id=current_user.id,
                from_status=old_status,
                to_status=update_data["status"],
                notes=f"Status updated from {old_status.value} to {update_data['status'].value}",
            )
            await complaint_repository.create_status_history(db, status_history)

        await db.commit()
        await db.refresh(updated_complaint)
        return ComplaintRead.model_validate(updated_complaint)

    return ComplaintRead.model_validate(complaint)

async def delete_complaint(
    db: AsyncSession,
    complaint_id: UUID,
    current_user: User,
) -> None:
    """
    Deletes a complaint record and records deletion event in audit logs.
    """
    complaint = await complaint_repository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found",
        )

    # Log deletion audit before removal
    audit_log = ComplaintAuditLog(
        complaint_id=complaint_id,
        user_id=current_user.id,
        action="DELETED",
        changed_fields={"complaint_id": str(complaint_id)},
    )
    await complaint_repository.create_audit_log(db, audit_log)

    await complaint_repository.delete(db, complaint)
    await db.commit()
