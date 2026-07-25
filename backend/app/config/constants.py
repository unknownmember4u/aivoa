"""
System constants for the Pharmaceutical Complaint System.
Provides centralized definitions for file uploads, pagination, and supported enum domains.
"""

# File Upload Constants
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "message/rfc822",
]

MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

# AI Defaults
DEFAULT_AI_MODEL = "gemma2-9b-it"

# Pagination Defaults
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Complaint Domain Constants
SUPPORTED_COMPLAINT_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_INVESTIGATION", "CLOSED"]
SUPPORTED_SEVERITY_VALUES = ["CRITICAL", "MAJOR", "MINOR"]
SUPPORTED_PRIORITY_VALUES = ["HIGH", "MEDIUM", "LOW"]
SUPPORTED_RISK_LEVELS = ["HIGH", "MEDIUM", "LOW"]
SUPPORTED_COMPLAINT_SOURCES = ["EMAIL", "PHONE", "WEB_PORTAL", "REGULATORY_NOTICE"]
