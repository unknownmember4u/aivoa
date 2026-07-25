from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.users import User
from app.schemas.chat_message import ChatMessageRead, ChatRequest, ChatResponse
from app.services import chat_service

router = APIRouter(tags=["Complaint AI Assistant"])

@router.post(
    "/{complaint_id}/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask the AI Assistant a question grounded on a specific complaint record",
)
async def ask_complaint_question_endpoint(
    complaint_id: UUID,
    chat_req: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Submits a question to the AI Assistant. The assistant is strictly grounded on the specified complaint
    record and attached document text. Saves both user question and assistant answer in message history.
    """
    return await chat_service.ask_question(
        db=db,
        complaint_id=complaint_id,
        question=chat_req.question,
        current_user=current_user,
    )

@router.get(
    "/{complaint_id}/chat",
    response_model=List[ChatMessageRead],
    summary="Retrieve chat history for a complaint",
)
async def get_complaint_chat_history_endpoint(
    complaint_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Returns the complete chronological chat message history for the specified complaint.
    """
    return await chat_service.get_chat_history(
        db=db,
        complaint_id=complaint_id,
        current_user=current_user,
    )
