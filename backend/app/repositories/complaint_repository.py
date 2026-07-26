import logging
import time
from typing import List, Optional, Tuple
from uuid import UUID
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.complaints import Complaint
from app.models.complaint_audit_logs import ComplaintAuditLog
from app.models.complaint_status_history import ComplaintStatusHistory
from app.models.enums import ComplaintStatus, Severity, RiskLevel

logger = logging.getLogger("backend_timing_audit")

async def create(db: AsyncSession, complaint: Complaint) -> Complaint:
    """
    Persists a new Complaint record to PostgreSQL.
    """
    t0 = time.perf_counter()
    db.add(complaint)
    await db.flush()
    await db.refresh(complaint)
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING REPOSITORY create] Duration: {dur}ms")
    return complaint

async def get_by_id(db: AsyncSession, complaint_id: UUID) -> Optional[Complaint]:
    """
    Retrieves a single Complaint by ID along with eager-loaded relations.
    """
    t0 = time.perf_counter()
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
    item = result.scalar_one_or_none()
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING REPOSITORY get_by_id] Duration: {dur}ms | Found: {item is not None}")
    return item

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
    t0 = time.perf_counter()
    query = select(Complaint)
    count_query = select(func.count(Complaint.id))

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

    # Search
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

    t_count_start = time.perf_counter()
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    t_count_dur = round((time.perf_counter() - t_count_start) * 1000, 3)

    t_fetch_start = time.perf_counter()
    items_result = await db.execute(query)
    items = list(items_result.scalars().all())
    t_fetch_dur = round((time.perf_counter() - t_fetch_start) * 1000, 3)

    total_dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(
        f"[TIMING REPOSITORY get_all] SQL Count Query: {t_count_dur}ms | SQL Items Fetch Query: {t_fetch_dur}ms | Total Repository Duration: {total_dur}ms | Returned: {len(items)} items"
    )

    return items, total

async def update(db: AsyncSession, db_complaint: Complaint, update_data: dict) -> Complaint:
    """
    Updates an existing Complaint record with a dictionary of changes.
    """
    t0 = time.perf_counter()
    for field, value in update_data.items():
        if hasattr(db_complaint, field):
            setattr(db_complaint, field, value)
    await db.flush()
    await db.refresh(db_complaint)
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING REPOSITORY update] Duration: {dur}ms")
    return db_complaint

async def create_audit_log(db: AsyncSession, audit_log: ComplaintAuditLog) -> ComplaintAuditLog:
    """
    Persists an audit log entry for a complaint event.
    """
    t0 = time.perf_counter()
    db.add(audit_log)
    await db.flush()
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING REPOSITORY create_audit_log] Duration: {dur}ms")
    return audit_log

async def create_status_history(db: AsyncSession, history: ComplaintStatusHistory) -> ComplaintStatusHistory:
    """
    Persists a status transition history entry for a complaint.
    """
    t0 = time.perf_counter()
    db.add(history)
    await db.flush()
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING REPOSITORY create_status_history] Duration: {dur}ms")
    return history
