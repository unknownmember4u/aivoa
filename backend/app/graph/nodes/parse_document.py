import email
import logging
import os
import time
from typing import Dict, Any
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

logger = logging.getLogger("backend_timing_audit")

def parse_document_file(file_path: str) -> str:
    """
    Reads a document file from disk and extracts normalized plain text.
    Supports PDF, DOCX, TXT, and EML files.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found at path: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

    elif ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            extracted = [page.extract_text() or "" for page in reader.pages]
            return "\n".join(extracted).strip()
        except Exception:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()

    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs if p.text.strip()]).strip()
        except Exception:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read().strip()

    elif ext == ".eml":
        with open(file_path, "rb") as f:
            msg = email.message_from_binary_file(f)
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body += part.get_payload(decode=True).decode("utf-8", errors="ignore")
        else:
            body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
        
        headers = f"From: {msg.get('From', '')}\nSubject: {msg.get('Subject', '')}\nDate: {msg.get('Date', '')}\n\n"
        return (headers + body).strip()

    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read().strip()

async def parse_document_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 1: Parses uploaded document file and extracts normalized raw_document_text.
    """
    t0 = time.perf_counter()
    file_path = state.get("uploaded_file_path")
    errors = list(state.get("errors", []))

    if not file_path:
        dur = round((time.perf_counter() - t0) * 1000, 3)
        logger.info(f"[TIMING LANGGRAPH NODE parse_document] Duration: {dur}ms | FAILED: No file path")
        return {
            "processing_status": ProcessingStatus.FAILED,
            "errors": errors + ["No uploaded_file_path provided in state"],
        }

    try:
        raw_text = parse_document_file(file_path)
        dur = round((time.perf_counter() - t0) * 1000, 3)
        logger.info(f"[TIMING LANGGRAPH NODE parse_document] Duration: {dur}ms | Extracted {len(raw_text)} chars")
        return {
            "raw_document_text": raw_text,
            "processing_status": ProcessingStatus.PARSING,
        }
    except Exception as e:
        dur = round((time.perf_counter() - t0) * 1000, 3)
        logger.error(f"[TIMING LANGGRAPH NODE parse_document FAILED] ({dur}ms): {str(e)}")
        return {
            "processing_status": ProcessingStatus.FAILED,
            "errors": errors + [f"ParseDocumentNode error: {str(e)}"],
        }
