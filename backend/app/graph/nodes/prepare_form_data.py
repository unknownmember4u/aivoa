from typing import Any, Dict
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

async def prepare_form_data_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node: Prepares frontend-ready complaint form data, calculates risk level using validated data,
    and updates the processing status. Does NOT perform AI generation calls.
    """
    validated = state.get("validated_fields", {})
    errors = list(state.get("errors", []))

    severity = str(validated.get("severity", "MAJOR")).upper()
    complaint_type = str(validated.get("complaint_type", "")).lower()

    # Determine risk level based on severity and defect keywords
    if severity == "CRITICAL" or any(kw in complaint_type for kw in ["contamination", "adverse", "sub-potency", "recall"]):
        risk_level = "HIGH"
    elif severity == "MAJOR":
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_level": risk_level,
        "processing_status": ProcessingStatus.READY_FOR_REVIEW,
        "errors": errors,
    }
