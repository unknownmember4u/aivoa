import io
import os
import zipfile
from typing import Tuple
from fastapi import HTTPException, UploadFile, status

from app.config.constants import ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES
from app.config.settings import settings

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".eml"}

def validate_file_signature(ext: str, content: bytes) -> None:
    """
    Lightweight server-side file signature (magic byte) and structural validation.
    Raises HTTP 400 if content does not match the claimed file extension.
    """
    if ext == ".pdf":
        if not content.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file signature (missing '%PDF' header magic bytes)",
            )

    elif ext == ".docx":
        # DOCX files are OpenXML ZIP containers
        if not content.startswith(b"PK\x03\x04") or not zipfile.is_zipfile(io.BytesIO(content)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid DOCX file signature (not a valid OpenXML ZIP container)",
            )

    elif ext == ".txt":
        # Verify text file contains no binary NULL bytes and uses valid text encoding
        if b"\x00" in content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid TXT file format (contains binary NULL bytes)",
            )
        try:
            content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content.decode("latin-1")
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid TXT file format (unparseable binary text encoding)",
                )

    elif ext == ".eml":
        # Check for standard email headers in the initial content block
        header_sample = content[:4096].lower()
        has_email_header = any(
            h in header_sample for h in [b"from:", b"subject:", b"date:", b"to:", b"received:", b"message-id:"]
        )
        if not has_email_header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid EML file format (missing standard email headers like From:, Subject:, Date:)",
            )

def validate_uploaded_file(file: UploadFile, content: bytes) -> Tuple[str, str, int]:
    """
    Validates uploaded file against size limits, empty buffers, extension whitelist, MIME types,
    and server-side file signatures (magic bytes).
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

    # Perform lightweight server-side magic byte / signature check
    validate_file_signature(ext, content)

    return filename, mime_type, file_size
