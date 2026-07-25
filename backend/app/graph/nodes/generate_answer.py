from typing import Any, Dict
from app.ai.client import groq_client
from app.ai.exceptions import AIServiceError
from app.graph.state import ComplaintGraphState

async def generate_answer_node(state: ComplaintGraphState) -> Dict[str, Any]:
    """
    Node 6: Generates a grounded, accurate answer to the user's question using Groq LLM.
    """
    question = state.get("current_question", "")
    metadata = state.get("metadata", {})
    context_str = metadata.get("retrieved_context", "")
    errors = list(state.get("errors", []))

    if not question:
        return {
            "current_answer": "No question provided to AI Assistant.",
            "errors": errors + ["GenerateAnswerNode error: current_question is empty"],
        }

    system_prompt = (
        "You are an expert Pharmaceutical Complaint AI Assistant. "
        "Answer the user's question accurately based ONLY on the provided complaint record context and document text. "
        "If the answer cannot be determined from the context, state that clearly."
    )

    full_prompt = f"Grounded Context:\n{context_str}\n\nUser Question: {question}"

    try:
        answer = await groq_client.generate(
            prompt=full_prompt,
            system_prompt=system_prompt,
        )
        return {
            "current_answer": answer,
        }
    except AIServiceError as e:
        return {
            "current_answer": f"Unable to generate answer due to AI service issue: {e.message}",
            "errors": errors + [f"GenerateAnswerNode AI failure: {e.message}"],
        }
    except Exception as e:
        return {
            "current_answer": "An unexpected error occurred while generating the answer.",
            "errors": errors + [f"GenerateAnswerNode error: {str(e)}"],
        }
