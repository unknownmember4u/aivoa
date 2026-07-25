from typing import Any, Dict
from app.ai.client import groq_client
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

async def prepare_form_data_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 4: Prepares frontend-ready complaint form data, computes AI summary, and calculates risk level.
    """
    validated = state.get("validated_fields", {})
    raw_text = state.get("raw_document_text", "")
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

    # Generate concise AI summary using Groq LLM
    try:
        summary_prompt = (
            f"Summarize this pharmaceutical complaint in 2 concise sentences for QA review:\n\n"
            f"Product: {validated.get('product_name', 'N/A')}\n"
            f"Batch: {validated.get('batch_number', 'N/A')}\n"
            f"Description: {validated.get('complaint_description', raw_text[:500])}"
        )
        ai_summary = await groq_client.generate(prompt=summary_prompt)
    except Exception:
        ai_summary = f"Complaint regarding {validated.get('product_name', 'Product')} (Batch: {validated.get('batch_number', 'N/A')})."

    return {
        "risk_level": risk_level,
        "ai_summary": ai_summary,
        "processing_status": ProcessingStatus.READY_FOR_REVIEW,
        "errors": errors,
    }
