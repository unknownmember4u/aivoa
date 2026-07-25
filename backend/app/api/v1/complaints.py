from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.enums import ComplaintStatus, Severity, RiskLevel
from app.models.users import User
from app.schemas.common import PaginatedResponse
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintListItem,
    ComplaintRead,
    ComplaintResponse,
    ComplaintUpdate,
)
from app.services import complaint_service

router = APIRouter(tags=["Complaints"])

@router.post(
    "",
    response_model=ComplaintRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new complaint record",
)
async def create_complaint_endpoint(
    complaint_in: ComplaintCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Creates a new customer complaint record. Automatically populates created_by from JWT
    and records an audit log entry.
    """
    return await complaint_service.create_complaint(
        db=db,
        complaint_in=complaint_in,
        current_user=current_user,
    )

@router.get(
    "",
    response_model=PaginatedResponse[ComplaintListItem],
    summary="List complaints with filtering, search, and pagination",
)
async def list_complaints_endpoint(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[ComplaintStatus] = Query(None, description="Filter by complaint status"),
    severity: Optional[Severity] = Query(None, description="Filter by complaint severity"),
    risk_level: Optional[RiskLevel] = Query(None, description="Filter by risk level"),
    search: Optional[str] = Query(None, description="Search term for product, batch, customer, or description"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort direction ('asc' or 'desc')"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Fetches complaints matching pagination, search text, severity, risk level, or status filters.
    """
    return await complaint_service.list_complaints(
        db=db,
        page=page,
        page_size=page_size,
        status_filter=status,
        severity=severity,
        risk_level=risk_level,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

@router.get(
    "/{id}",
    response_model=ComplaintResponse,
    summary="Get detailed complaint information by ID",
)
async def get_complaint_endpoint(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieves full details for a single complaint including associated document metadata.
    """
    return await complaint_service.get_complaint(db=db, complaint_id=id)

@router.put(
    "/{id}",
    response_model=ComplaintRead,
    summary="Update an existing complaint record",
)
async def update_complaint_endpoint(
    id: UUID,
    complaint_in: ComplaintUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Updates an existing complaint record. Automatically tracks field changes in audit logs
    and logs status updates.
    """
    return await complaint_service.update_complaint(
        db=db,
        complaint_id=id,
        complaint_in=complaint_in,
        current_user=current_user,
    )

@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a complaint record",
)
async def delete_complaint_endpoint(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Logically closes a complaint record (sets status to CLOSED), records audit log and status history,
    and updates updated_by_id. No physical SQL row deletion is performed. Returns HTTP 204.
    """
    await complaint_service.delete_complaint(
        db=db,
        complaint_id=id,
        current_user=current_user,
    )
    return None
