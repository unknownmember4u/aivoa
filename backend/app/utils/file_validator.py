import os
from typing import Tuple
from fastapi import HTTPException, UploadFile, status

from app.config.constants import ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES
from app.config.settings import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".eml"}

def validate_uploaded_file(file: UploadFile, content: bytes) -> Tuple[str, str, int]:
    """
    Validates uploaded file against size limits, empty buffers, extension whitelist, and MIME types.
    Returns sanitized (original_filename, mime_type, file_size).
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a filename",
        )

    # Sanitize filename to prevent directory traversal
    filename = os.path.basename(file.filename.strip())
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    file_size = len(content)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)",
        )

    if file_size > MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size} bytes) exceeds maximum limit of {max_mb} MB",
        )

    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME_TYPES and mime_type != "application/octet-stream":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported MIME type '{mime_type}'. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    return filename, mime_type, file_size
