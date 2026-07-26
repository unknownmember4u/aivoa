import logging
import time
from typing import List, Optional, Tuple
from uuid import UUID
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.complaint_documents import ComplaintDocument
from app.schemas.common import PaginatedResponse
from app.schemas.complaint_document import ComplaintDocumentRead
from app.utils.file_storage import save_file_to_disk
from app.utils.file_validator import validate_uploaded_file

logger = logging.getLogger("backend_timing_audit")

async def validate_and_store_file(file: UploadFile) -> Tuple[str, str, str, int]:
    """
    Reads upload buffer, validates constraints, and writes file to disk.
    Returns (original_filename, stored_path, mime_type, file_size).
    """
    t0 = time.perf_counter()
    content = await file.read()
    t_read_dur = round((time.perf_counter() - t0) * 1000, 3)

    t_val_start = time.perf_counter()
    filename, mime_type, file_size = validate_uploaded_file(file, content)
    t_val_dur = round((time.perf_counter() - t_val_start) * 1000, 3)

    t_write_start = time.perf_counter()
    stored_path = save_file_to_disk(content, filename)
    t_write_dur = round((time.perf_counter() - t_write_start) * 1000, 3)

    total_dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(
        f"[TIMING FILE UPLOAD STORE] Read: {t_read_dur}ms | Validation: {t_val_dur}ms | Disk Write: {t_write_dur}ms | Total Store: {total_dur}ms"
    )

    return filename, stored_path, mime_type, file_size

async def create_document_record(
    db: AsyncSession,
    original_filename: str,
    stored_path: str,
    file_size: int,
    mime_type: str,
    complaint_id: Optional[UUID] = None,
) -> ComplaintDocumentRead:
    """
    Persists ComplaintDocument record into PostgreSQL.
    """
    t0 = time.perf_counter()
    document = ComplaintDocument(
        file_name=original_filename,
        file_path=stored_path,
        file_size=file_size,
        mime_type=mime_type,
        complaint_id=complaint_id,
        raw_extracted_text=None,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING FILE UPLOAD DB_INSERT] Database insert & commit duration: {dur}ms")
    return ComplaintDocumentRead.model_validate(document)

async def get_document(db: AsyncSession, document_id: UUID) -> ComplaintDocumentRead:
    """
    Retrieves document metadata by ID or raises 404.
    """
    t0 = time.perf_counter()
    stmt = select(ComplaintDocument).where(ComplaintDocument.id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING DOCUMENT SERVICE get_document] Duration: {dur}ms")
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found",
        )
    return ComplaintDocumentRead.model_validate(document)

async def list_documents(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    complaint_id: Optional[UUID] = None,
) -> PaginatedResponse[ComplaintDocumentRead]:
    """
    Lists uploaded documents with optional filtering by complaint_id and pagination.
    """
    t0 = time.perf_counter()
    skip = (page - 1) * page_size
    query = select(ComplaintDocument)
    count_query = select(func.count()).select_from(ComplaintDocument)

    if complaint_id:
        query = query.where(ComplaintDocument.complaint_id == complaint_id)
        count_query = count_query.where(ComplaintDocument.complaint_id == complaint_id)

    query = query.order_by(ComplaintDocument.uploaded_at.desc()).offset(skip).limit(page_size)

    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    items_res = await db.execute(query)
    items = list(items_res.scalars().all())

    doc_items = [ComplaintDocumentRead.model_validate(doc) for doc in items]
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    dur = round((time.perf_counter() - t0) * 1000, 3)
    logger.info(f"[TIMING DOCUMENT SERVICE list_documents] Total Duration: {dur}ms")

    return PaginatedResponse[ComplaintDocumentRead](
        items=doc_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
