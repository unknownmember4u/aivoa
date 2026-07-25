from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.common import PaginatedResponse
from app.schemas.complaint_document import ComplaintDocumentRead
from app.services import document_service

router = APIRouter(tags=["Document Upload"])

@router.post(
    "",
    response_model=ComplaintDocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a complaint document file",
)
async def upload_document_endpoint(
    file: UploadFile = File(..., description="Uploaded complaint document (PDF, DOCX, TXT, EML)"),
    complaint_id: Optional[UUID] = Form(None, description="Optional associated complaint ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Validates file format, size limits, and security constraints, saves file securely to disk with UUID filename,
    and registers a ComplaintDocument record in PostgreSQL.
    """
    filename, stored_path, mime_type, file_size = await document_service.validate_and_store_file(file)
    return await document_service.create_document_record(
        db=db,
        original_filename=filename,
        stored_path=stored_path,
        file_size=file_size,
        mime_type=mime_type,
        complaint_id=complaint_id,
    )

@router.get(
    "/{id}",
    response_model=ComplaintDocumentRead,
    summary="Get document metadata by ID",
)
async def get_document_endpoint(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Retrieves document metadata for a given document UUID.
    """
    return await document_service.get_document(db=db, document_id=id)

@router.get(
    "",
    response_model=PaginatedResponse[ComplaintDocumentRead],
    summary="List uploaded documents",
)
async def list_documents_endpoint(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    complaint_id: Optional[UUID] = Query(None, description="Filter by complaint ID"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns a paginated list of uploaded document metadata.
    """
    return await document_service.list_documents(
        db=db,
        page=page,
        page_size=page_size,
        complaint_id=complaint_id,
    )
