from typing import Any, Dict
from app.graph.state import ComplaintGraphState

def build_grounded_context_string(state: ComplaintGraphState) -> str:
    """
    Combines validated fields, raw document text, and past chat history into a grounded context string.
    """
    validated = state.get("validated_fields", {})
    raw_text = state.get("raw_document_text", "No raw document text available.")
    chat_history = state.get("chat_history", [])

    context_parts = [
        "=== COMPLAINT RECORD CONTEXT ===",
        f"Product Name: {validated.get('product_name', 'N/A')}",
        f"Batch Number: {validated.get('batch_number', 'N/A')}",
        f"Customer Name: {validated.get('customer_name', 'N/A')}",
        f"Dosage Strength / Grade: {validated.get('strength_grade', 'N/A')}",
        f"Complaint Type / Defect Category: {validated.get('complaint_type', 'N/A')}",
        f"Severity: {validated.get('severity', 'N/A')}",
        f"Risk Level: {state.get('risk_level', 'N/A')}",
        f"Summary: {state.get('ai_summary', 'N/A')}",
        f"Complaint Narrative / Description: {validated.get('complaint_description', 'N/A')}",
        "",
        "=== ORIGINAL DOCUMENT TEXT ===",
        raw_text[:4000],  # Truncate context to stay well within token limits
    ]

    if chat_history:
        context_parts.append("\n=== RECENT CHAT HISTORY ===")
        for msg in chat_history[-5:]:  # Include last 5 messages
            context_parts.append(f"{msg.get('role', 'USER')}: {msg.get('content', '')}")

    return "\n".join(context_parts)

async def retrieve_context_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 5: Assembles grounded context for AI Chat Assistant.
    """
    context_str = build_grounded_context_string(state)
    return {
        "metadata": {
            **state.get("metadata", {}),
            "retrieved_context": context_str,
        }
    }
