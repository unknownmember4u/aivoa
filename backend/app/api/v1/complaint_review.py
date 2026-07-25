from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.complaint import ComplaintCreate, ComplaintRead
from app.services import complaint_review_service

router = APIRouter(tags=["Complaint Review & Submission"])

@router.post(
    "/submit",
    response_model=ComplaintRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a human-reviewed and finalized complaint form",
)
async def submit_reviewed_complaint_endpoint(
    complaint_in: ComplaintCreate,
    document_id: Optional[UUID] = Query(None, description="Optional ID of associated uploaded document to link"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Finalizes and submits a user-reviewed complaint. Validates all mandatory fields,
    sets status to SUBMITTED, links uploaded document metadata, and creates audit log
    and status transition records.
    """
    return await complaint_review_service.submit_reviewed_complaint(
        db=db,
        complaint_in=complaint_in,
        current_user=current_user,
        document_id=document_id,
    )
