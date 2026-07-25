from typing import Any, Dict
from app.ai.client import groq_client
from app.graph.state import ComplaintGraphState

async def generate_summary_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Dedicated Node: Generates a concise AI summary of the complaint using Groq LLM.
    """
    validated = state.get("validated_fields", {})
    raw_text = state.get("raw_document_text", "")
    errors = list(state.get("errors", []))

    summary_prompt = (
        f"Summarize this pharmaceutical complaint in 2 concise sentences for QA review:\n\n"
        f"Product: {validated.get('product_name', 'N/A')}\n"
        f"Batch: {validated.get('batch_number', 'N/A')}\n"
        f"Description: {validated.get('complaint_description', raw_text[:500])}"
    )

    system_prompt = "You are a Pharmaceutical Quality Assurance AI Assistant specializing in concise complaint summaries."

    try:
        ai_summary = await groq_client.generate(
            prompt=summary_prompt,
            system_prompt=system_prompt,
        )
        return {
            "ai_summary": ai_summary,
        }
    except Exception as e:
        fallback_summary = f"Complaint regarding {validated.get('product_name', 'Product')} (Batch: {validated.get('batch_number', 'N/A')})."
        return {
            "ai_summary": fallback_summary,
            "errors": errors + [f"GenerateSummaryNode error: {str(e)}"],
        }
