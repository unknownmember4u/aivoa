from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.complaint import ComplaintUploadResponse
from app.services import complaint_extraction_service

router = APIRouter(tags=["Complaint AI Extraction"])

@router.post(
    "/extract/{document_id}",
    response_model=ComplaintUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract structured complaint information from an uploaded document using AI",
)
async def extract_complaint_endpoint(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Triggers the Complaint Intake LangGraph workflow to parse the uploaded document,
    extract structured pharma metadata via Groq LLM, validate fields, and calculate risk level.
    Does NOT save a complaint record to the database.
    """
    return await complaint_extraction_service.extract_complaint(
        db=db,
        document_id=document_id,
        current_user=current_user,
    )
