from typing import Literal
from langgraph.graph import END, START, StateGraph

from app.graph.nodes import (
    extract_entities_node,
    generate_summary_node,
    parse_document_node,
    prepare_form_data_node,
    validate_schema_node,
)
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus

def _check_after_parse(state: ComplaintGraphState) -> str:
    """Conditional routing after parse document node."""
    if state.get("processing_status") == ProcessingStatus.FAILED:
        return END
    return "extract_entities"

def _check_after_extract(state: ComplaintGraphState) -> str:
    """Conditional routing after entity extraction node."""
    if state.get("processing_status") == ProcessingStatus.FAILED:
        return END
    return "validate_schema"

def _check_after_validate(state: ComplaintGraphState) -> str:
    """
    Conditional decision node after schema validation:
    If processing_status is FAILED, terminate early (END).
    Otherwise ALWAYS proceed to generate_summary -> prepare_form_data.
    """
    if state.get("processing_status") == ProcessingStatus.FAILED:
        return END
    return "generate_summary"

def build_complaint_workflow():
    """
    Constructs and compiles the Complaint Intake LangGraph StateGraph.
    
    Execution Flow:
    START -> ParseDocumentNode -> ExtractEntitiesNode -> ValidateSchemaNode
          -> GenerateSummaryNode -> PrepareFormDataNode -> END
    """
    workflow = StateGraph(ComplaintGraphState)

    # 1. Add Graph Nodes
    workflow.add_node("parse_document", parse_document_node)
    workflow.add_node("extract_entities", extract_entities_node)
    workflow.add_node("validate_schema", validate_schema_node)
    workflow.add_node("generate_summary", generate_summary_node)
    workflow.add_node("prepare_form_data", prepare_form_data_node)

    # 2. Add Edges & Conditional Routing
    workflow.add_edge(START, "parse_document")

    workflow.add_conditional_edges(
        "parse_document",
        _check_after_parse,
        {
            "extract_entities": "extract_entities",
            END: END,
        },
    )

    workflow.add_conditional_edges(
        "extract_entities",
        _check_after_extract,
        {
            "validate_schema": "validate_schema",
            END: END,
        },
    )

    workflow.add_conditional_edges(
        "validate_schema",
        _check_after_validate,
        {
            "generate_summary": "generate_summary",
            END: END,
        },
    )

    workflow.add_edge("generate_summary", "prepare_form_data")
    workflow.add_edge("prepare_form_data", END)

    # 3. Compile and Return Executable Graph
    return workflow.compile()

# Global compiled intake workflow graph instance
complaint_intake_graph = build_complaint_workflow()
