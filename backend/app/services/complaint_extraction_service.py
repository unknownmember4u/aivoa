import os
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.exceptions import AIRateLimitError, AITimeoutError, AIServiceError
from app.graph.complaint_workflow import complaint_intake_graph
from app.graph.state import ComplaintGraphState
from app.graph.types import ProcessingStatus
from app.models.users import User
from app.schemas.complaint import ComplaintUploadResponse
from app.services import document_service

async def extract_complaint(
    db: AsyncSession,
    document_id: UUID,
    current_user: User,
) -> ComplaintUploadResponse:
    """
    Executes the Complaint Intake LangGraph workflow against an uploaded document
    to extract, validate, and summarize complaint metadata.
    """
    # 1. Retrieve document metadata
    document = await document_service.get_document(db, document_id)

    # 2. Verify file existence on disk
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document file not found on server disk at path '{document.file_path}'",
        )

    # 3. Create initial ComplaintGraphState
    initial_state: ComplaintGraphState = {
        "document_id": document.id,
        "uploaded_file_path": document.file_path,
        "user_id": current_user.id,
        "processing_status": ProcessingStatus.UPLOADED,
        "errors": [],
        "missing_fields": [],
        "extracted_fields": {},
        "validated_fields": {},
    }

    # 4. Execute LangGraph workflow
    try:
        final_state: ComplaintGraphState = await complaint_intake_graph.ainvoke(initial_state)
    except AIRateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"AI Rate Limit Exceeded: {e.message}",
        )
    except AITimeoutError as e:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"AI Service Timeout: {e.message}",
        )
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI Provider Error: {e.message}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected extraction workflow error: {str(e)}",
        )

    # 5. Check workflow status
    if final_state.get("processing_status") == ProcessingStatus.FAILED:
        errors = final_state.get("errors", ["Unknown extraction failure"])
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Complaint extraction failed: {'; '.join(errors)}",
        )

    # 6. Format and return response schema
    validated_fields = final_state.get("validated_fields", {})
    extracted_fields = final_state.get("extracted_fields", {})
    output_data = validated_fields if validated_fields else extracted_fields

    return ComplaintUploadResponse(
        extracted_data=output_data,
        confidence_score=final_state.get("confidence_score", 0.90),
        missing_fields=final_state.get("missing_fields", []),
        ai_summary=final_state.get("ai_summary"),
        risk_level=final_state.get("risk_level"),
    )
