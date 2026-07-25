from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.complaints import Complaint
from app.models.complaint_audit_logs import ComplaintAuditLog
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.enums import ComplaintStatus, Severity, RiskLevel

async def create(db: AsyncSession, complaint: Complaint) -> Complaint:
    """
    Persists a new Complaint record to PostgreSQL.
    """
    db.add(complaint)
    await db.flush()
    await db.refresh(complaint)
    return complaint

async def get_by_id(db: AsyncSession, complaint_id: UUID) -> Optional[Complaint]:
    """
    Retrieves a single Complaint by ID along with eager-loaded relations.
    """
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.documents),
            selectinload(Complaint.audit_logs),
            selectinload(Complaint.status_history),
            selectinload(Complaint.chat_messages),
        )
        .where(Complaint.id == complaint_id)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_all(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
    status: Optional[ComplaintStatus] = None,
    severity: Optional[Severity] = None,
    risk_level: Optional[RiskLevel] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> Tuple[List[Complaint], int]:
    """
    Fetches complaints with filtering, search, sorting, and pagination. Returns (items, total_count).
    """
    query = select(Complaint)
    count_query = select(func.count()).select_from(Complaint)

    # Filtering
    if status:
        query = query.where(Complaint.status == status)
        count_query = count_query.where(Complaint.status == status)
    if severity:
        query = query.where(Complaint.severity == severity)
        count_query = count_query.where(Complaint.severity == severity)
    if risk_level:
        query = query.where(Complaint.risk_level == risk_level)
        count_query = count_query.where(Complaint.risk_level == risk_level)

    # Search in product name, batch number, customer name, or description
    if search:
        search_pattern = f"%{search.strip()}%"
        search_filter = or_(
            Complaint.product_name.ilike(search_pattern),
            Complaint.batch_number.ilike(search_pattern),
            Complaint.customer_name.ilike(search_pattern),
            Complaint.complaint_description.ilike(search_pattern),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    # Sorting
    sort_column = getattr(Complaint, sort_by, Complaint.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Pagination
    query = query.offset(skip).limit(limit)

    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    items_result = await db.execute(query)
    items = list(items_result.scalars().all())

    return items, total

async def update(db: AsyncSession, db_complaint: Complaint, update_data: dict) -> Complaint:
    """
    Updates an existing Complaint record with a dictionary of changes.
    """
    for field, value in update_data.items():
        if hasattr(db_complaint, field):
            setattr(db_complaint, field, value)
    await db.flush()
    await db.refresh(db_complaint)
    return db_complaint

async def delete(db: AsyncSession, complaint: Complaint) -> None:
    """
    Deletes a Complaint record from PostgreSQL.
    """
    await db.delete(complaint)
    await db.flush()

async def create_audit_log(db: AsyncSession, audit_log: ComplaintAuditLog) -> ComplaintAuditLog:
    """
    Persists an audit log entry for a complaint event.
    """
    db.add(audit_log)
    await db.flush()
    return audit_log

async def create_status_history(db: AsyncSession, history: ComplaintStatusHistory) -> ComplaintStatusHistory:
    """
    Persists a status transition history entry for a complaint.
    """
    db.add(history)
    await db.flush()
    return history
