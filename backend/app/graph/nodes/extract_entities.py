from typing import Any, Dict
from app.ai.client import groq_client
from app.ai.exceptions import AIServiceError
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

EXTRACTION_RESPONSE_SCHEMA = {
    "customer_name": "Name of customer/reporter",
    "complaint_source": "Source (EMAIL, PHONE, WEB_PORTAL, REGULATORY_NOTICE)",
    "product_name": "Pharmaceutical product name",
    "strength_grade": "Dosage strength or grade (e.g. 500mg)",
    "batch_number": "Lot or batch number",
    "manufacturing_date": "YYYY-MM-DD or null",
    "expiry_date": "YYYY-MM-DD or null",
    "quantity": "Defective quantity (integer) or null",
    "complaint_type": "Defect classification category",
    "complaint_description": "Detailed narrative description",
    "complaint_date": "YYYY-MM-DD or null",
    "severity": "CRITICAL, MAJOR, or MINOR",
    "priority": "HIGH, MEDIUM, or LOW",
    "confidence_score": "Float between 0.0 and 1.0",
}

async def extract_entities_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 2: Extracts structured complaint fields from raw_document_text using Groq LLM.
    """
    raw_text = state.get("raw_document_text", "")
    errors = list(state.get("errors", []))

    if not raw_text:
        return {
            "processing_status": ProcessingStatus.FAILED,
            "errors": errors + ["ExtractEntitiesNode error: raw_document_text is empty"],
        }

    system_prompt = (
        "You are an expert Pharmaceutical Quality Assurance AI agent. "
        "Extract structured complaint fields from the provided document text accurately. "
        "Strictly adhere to the target JSON schema."
    )

    try:
        extracted = await groq_client.generate_structured(
            prompt=f"Extract complaint metadata from document:\n\n{raw_text}",
            response_schema=EXTRACTION_RESPONSE_SCHEMA,
            system_prompt=system_prompt,
        )

        confidence_score = float(extracted.pop("confidence_score", 0.90))

        return {
            "extracted_fields": extracted,
            "confidence_score": min(max(confidence_score, 0.0), 1.0),
            "processing_status": ProcessingStatus.EXTRACTING,
        }

    except AIServiceError as e:
        return {
            "processing_status": ProcessingStatus.FAILED,
            "errors": errors + [f"ExtractEntitiesNode AI failure: {e.message}"],
        }
    except Exception as e:
        return {
            "processing_status": ProcessingStatus.FAILED,
            "errors": errors + [f"ExtractEntitiesNode error: {str(e)}"],
        }
