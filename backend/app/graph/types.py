import enum
from typing import Any, Dict, List, Optional, TypedDict

class ProcessingStatus(str, enum.Enum):
    """
    Lifecycle status enumeration for LangGraph execution workflows.
    """
    UPLOADED = "UPLOADED"
    PARSING = "PARSING"
    EXTRACTING = "EXTRACTING"
    VALIDATING = "VALIDATING"
    READY_FOR_REVIEW = "READY_FOR_REVIEW"
    FAILED = "FAILED"

class ExtractedComplaintData(TypedDict, total=False):
    """
    Structured layout for complaint fields extracted from documents by LLM.
    """
    customer_name: Optional[str]
    complaint_source: Optional[str]
    product_name: Optional[str]
    strength_grade: Optional[str]
    batch_number: Optional[str]
    manufacturing_date: Optional[str]
    expiry_date: Optional[str]
    quantity: Optional[int]
    complaint_type: Optional[str]
    complaint_description: Optional[str]
    complaint_date: Optional[str]
    severity: Optional[str]
    priority: Optional[str]

class ValidationResult(TypedDict):
    """
    Schema validation output summary detailing missing/invalid fields and confidence score.
    """
    is_valid: bool
    missing_fields: List[str]
    invalid_fields: Dict[str, str]
    confidence_score: float

class ChatContext(TypedDict):
    """
    Single turn chat message item for graph state chat history tracking.
    """
    role: str  # 'USER' or 'ASSISTANT'
    content: str
    timestamp: Optional[str]

class GraphMetadata(TypedDict, total=False):
    """
    Operational execution metadata tracked across node executions.
    """
    start_time: str
    execution_time_ms: float
    model_used: str
    token_usage: Dict[str, int]
