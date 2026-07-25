from typing import Any, Dict, List, Optional, TypedDict
from uuid import UUID

from app.graph.types import ChatContext, GraphMetadata, ProcessingStatus

class ComplaintGraphState(TypedDict, total=False):
    """
    Shared execution state for LangGraph Complaint Workflows (Intake & Assistant).
    Carries raw document text, parsed fields, validation state, and chat history.
    """
    # Identifiers
    document_id: Optional[UUID]
    complaint_id: Optional[UUID]
    user_id: Optional[UUID]

    # Ingestion & Text Data
    raw_document_text: Optional[str]
    uploaded_file_path: Optional[str]

    # Extraction & Field Validation
    extracted_fields: Dict[str, Any]
    validated_fields: Dict[str, Any]
    missing_fields: List[str]
    confidence_score: float

    # AI Risk Assessment & Summarization
    risk_level: Optional[str]
    ai_summary: Optional[str]

    # Interactive Q&A Assistant State
    chat_history: List[ChatContext]
    current_question: Optional[str]
    current_answer: Optional[str]

    # Diagnostics & Lifecycle Metadata
    errors: List[str]
    metadata: GraphMetadata
    processing_status: ProcessingStatus
