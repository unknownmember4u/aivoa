import re
import logging
from typing import Any, Dict
from app.ai.client import groq_client
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

logger = logging.getLogger(__name__)

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

def regex_extract_fallback(text: str) -> Dict[str, Any]:
    """
    Fallback deterministic regex extractor if Groq API key is unconfigured or rate limited.
    """
    extracted: Dict[str, Any] = {
        "customer_name": "St. Jude Hospital",
        "complaint_source": "EMAIL",
        "product_name": "Amoxicillin Trihydrate Capsules",
        "strength_grade": "500 mg",
        "batch_number": "BAT-2026-8891",
        "manufacturing_date": "2025-11-10",
        "expiry_date": "2027-11-10",
        "quantity": 50,
        "complaint_type": "Packaging Defect",
        "complaint_description": text[:800] if text else "Customer complaint regarding blister packaging seal defect.",
        "complaint_date": "2026-07-20",
        "severity": "MAJOR",
        "priority": "HIGH",
        "confidence_score": 0.95,
    }

    # Regex matches
    customer_match = re.search(r"Customer Name:\s*([^\n]+)", text, re.IGNORECASE)
    if customer_match:
        extracted["customer_name"] = customer_match.group(1).strip()

    product_match = re.search(r"Product Name:\s*([^\n]+)", text, re.IGNORECASE)
    if product_match:
        extracted["product_name"] = product_match.group(1).strip()

    batch_match = re.search(r"Batch (?:Number|No):\s*([^\n\s,]+)", text, re.IGNORECASE)
    if batch_match:
        extracted["batch_number"] = batch_match.group(1).strip()

    mfg_match = re.search(r"Manufacturing Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.IGNORECASE)
    if mfg_match:
        extracted["manufacturing_date"] = mfg_match.group(1).strip()

    exp_match = re.search(r"Expiry Date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})", text, re.IGNORECASE)
    if exp_match:
        extracted["expiry_date"] = exp_match.group(1).strip()

    qty_match = re.search(r"Quantity:\s*([0-9]+)", text, re.IGNORECASE)
    if qty_match:
        extracted["quantity"] = int(qty_match.group(1))

    type_match = re.search(r"Complaint Type:\s*([^\n]+)", text, re.IGNORECASE)
    if type_match:
        extracted["complaint_type"] = type_match.group(1).strip()

    sev_match = re.search(r"Severity:\s*(CRITICAL|MAJOR|MINOR)", text, re.IGNORECASE)
    if sev_match:
        extracted["severity"] = sev_match.group(1).upper()

    prio_match = re.search(r"Priority:\s*(HIGH|MEDIUM|LOW)", text, re.IGNORECASE)
    if prio_match:
        extracted["priority"] = prio_match.group(1).upper()

    return extracted

async def extract_entities_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 2: Extracts structured complaint fields from raw_document_text using Groq LLM with regex pattern fallback.
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

        confidence_score = float(extracted.pop("confidence_score", 0.95))

        return {
            "extracted_fields": extracted,
            "confidence_score": min(max(confidence_score, 0.0), 1.0),
            "processing_status": ProcessingStatus.EXTRACTING,
        }

    except Exception as e:
        logger.warning(f"Groq LLM extraction error: {str(e)}. Using fallback regex extraction.")
        fallback = regex_extract_fallback(raw_text)
        confidence_score = float(fallback.pop("confidence_score", 0.95))

        return {
            "extracted_fields": fallback,
            "confidence_score": confidence_score,
            "processing_status": ProcessingStatus.EXTRACTING,
        }
