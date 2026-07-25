from typing import Any, Dict, List
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

REQUIRED_FIELDS = [
    "customer_name",
    "product_name",
    "batch_number",
    "complaint_type",
    "complaint_description",
]

async def validate_schema_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 3: Validates extracted complaint fields against mandatory schema requirements.
    Detects missing fields and populates validated_fields dictionary.
    """
    extracted = state.get("extracted_fields", {})
    errors = list(state.get("errors", []))
    missing_fields: List[str] = []
    validated_fields: Dict[str, Any] = {}

    for key, val in extracted.items():
        if val is not None and str(val).strip() != "":
            validated_fields[key] = val

    for field in REQUIRED_FIELDS:
        if field not in validated_fields:
            missing_fields.append(field)

    return {
        "validated_fields": validated_fields,
        "missing_fields": missing_fields,
        "processing_status": ProcessingStatus.VALIDATING,
        "errors": errors,
    }
