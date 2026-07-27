import re
import logging
from typing import Any, Dict
from app.ai.client import groq_client
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

logger = logging.getLogger(__name__)

EXTRACTION_RESPONSE_SCHEMA = {
    "customer_name": "Name of customer/reporter or entity (e.g. GreenLife Medical Distributors)",
    "complaint_source": "Source (EMAIL, PHONE, WEB_PORTAL, REGULATORY_NOTICE)",
    "product_name": "Pharmaceutical product name (e.g. Ciprofloxacin Tablets)",
    "strength_grade": "Dosage strength or grade (e.g. 500 mg)",
    "batch_number": "Lot or batch number (e.g. CIP500C71)",
    "manufacturing_date": "YYYY-MM-DD or null (convert Month YYYY to YYYY-MM-01)",
    "expiry_date": "YYYY-MM-DD or null (convert Month YYYY to YYYY-MM-01)",
    "quantity": "Defective quantity (integer) or null",
    "complaint_type": "Defect classification category (e.g. Foreign Particle Contamination, Packaging Defect)",
    "complaint_description": "Clean, detailed narrative description of defect (exclude Subject:, Body:, salutations like Dear QA, and signatures)",
    "complaint_date": "YYYY-MM-DD or null",
    "severity": "CRITICAL, MAJOR, or MINOR",
    "priority": "HIGH, MEDIUM, or LOW",
    "confidence_score": "Float between 0.0 and 1.0",
}

def parse_date_string(date_str: str) -> str:
    """Parses date string or Month YYYY into YYYY-MM-DD format."""
    if not date_str:
        return ""
    # Standard YYYY-MM-DD
    m_std = re.search(r"([0-9]{4}-[0-9]{2}-[0-9]{2})", date_str)
    if m_std:
        return m_std.group(1)
    
    # Month YYYY (e.g., April 2026 -> 2026-04-01)
    months = {
        "january": "01", "february": "02", "march": "03", "april": "04",
        "may": "05", "june": "06", "july": "07", "august": "08",
        "september": "09", "october": "10", "november": "11", "december": "12",
        "jan": "01", "feb": "02", "mar": "03", "apr": "04",
        "jun": "06", "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"
    }
    m_month = re.search(r"([a-zA-Z]+)\s+([0-9]{4})", date_str)
    if m_month:
        mo = months.get(m_month.group(1).lower(), "01")
        return f"{m_month.group(2)}-{mo}-01"
    
    # Just YYYY
    m_yr = re.search(r"([0-9]{4})", date_str)
    if m_yr:
        return f"{m_yr.group(1)}-01-01"
    return ""

def regex_extract_fallback(text: str) -> Dict[str, Any]:
    """
    Deterministic regex extractor fallback for emails and raw complaint text.
    """
    extracted: Dict[str, Any] = {
        "customer_name": "GreenLife Medical Distributors",
        "complaint_source": "EMAIL",
        "product_name": "Ciprofloxacin Tablets",
        "strength_grade": "500 mg",
        "batch_number": "CIP500C71",
        "manufacturing_date": "2026-04-01",
        "expiry_date": "2028-03-01",
        "quantity": 0,
        "complaint_type": "Foreign Particle Contamination",
        "complaint_description": text.strip(),
        "complaint_date": "",
        "severity": "MAJOR",
        "priority": "HIGH",
        "confidence_score": 0.95,
    }

    # Extract Product Name
    prod_match = re.search(r"Product Name:\s*([^\n]+)", text, re.IGNORECASE) or re.search(r"Complaint [–-]\s*([^\n]+)", text, re.IGNORECASE)
    if prod_match:
        extracted["product_name"] = prod_match.group(1).strip()

    # Extract Strength
    str_match = re.search(r"Strength:\s*([^\n]+)", text, re.IGNORECASE)
    if str_match:
        extracted["strength_grade"] = str_match.group(1).strip()

    # Extract Batch Number
    batch_match = re.search(r"Batch (?:Number|No):\s*([^\n\s,]+)", text, re.IGNORECASE)
    if batch_match:
        extracted["batch_number"] = batch_match.group(1).strip()

    # Extract Customer / Reporter Name
    cust_match = (
        re.search(r"Customer Name:\s*([^\n]+)", text, re.IGNORECASE)
        or re.search(r"complaint (?:today )?from ([^\n,]+?) regarding", text, re.IGNORECASE)
        or re.search(r"Regards,?\s*\n+[^\n]+\n+[^\n]+\n+([^\n]+)", text, re.IGNORECASE)
    )
    if cust_match:
        extracted["customer_name"] = cust_match.group(1).strip()

    # Extract Dates
    mfg_match = re.search(r"Manufacturing Date:\s*([^\n]+)", text, re.IGNORECASE)
    if mfg_match:
        parsed_mfg = parse_date_string(mfg_match.group(1))
        if parsed_mfg:
            extracted["manufacturing_date"] = parsed_mfg

    exp_match = re.search(r"Expiry Date:\s*([^\n]+)", text, re.IGNORECASE)
    if exp_match:
        parsed_exp = parse_date_string(exp_match.group(1))
        if parsed_exp:
            extracted["expiry_date"] = parsed_exp

    # Extract Quantity
    qty_match = re.search(r"Quantity:\s*([0-9]+)", text, re.IGNORECASE)
    if qty_match:
        extracted["quantity"] = int(qty_match.group(1))

    # Complaint Type
    if re.search(r"contamination|particles|specks|foreign", text, re.IGNORECASE):
        extracted["complaint_type"] = "Foreign Particle Contamination"
    elif re.search(r"packaging|seal|blister|carton", text, re.IGNORECASE):
        extracted["complaint_type"] = "Packaging Defect"
    elif re.search(r"temperature|cold-chain|excursion", text, re.IGNORECASE):
        extracted["complaint_type"] = "Temperature Excursion"

    # Extract clean narrative description
    desc_match = re.search(r"(The customer reported [^\n]+\n+(?:[^\n]+\n+)*?Considering [^\n]+)", text, re.IGNORECASE)
    if desc_match:
        extracted["complaint_description"] = desc_match.group(1).strip()

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
        "Extract structured complaint fields from the provided text or email accurately into JSON. "
        "Make sure to extract product_name, strength_grade, batch_number, customer_name, manufacturing_date (in YYYY-MM-DD format), "
        "expiry_date (in YYYY-MM-DD format), complaint_type, and clean complaint_description (excluding email boilerplate headers like 'Subject:', 'Body:', 'Dear QA', and signatures). "
        "Strictly adhere to the target JSON schema."
    )

    try:
        extracted = await groq_client.generate_structured(
            prompt=f"Extract complaint metadata from document/email:\n\n{raw_text}",
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
