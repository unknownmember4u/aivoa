from datetime import datetime, timedelta, timezone
from typing import List
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.graph.nodes.generate_answer import generate_answer_node
from app.graph.nodes.retrieve_context import retrieve_context_node
from app.graph.state import ComplaintGraphState
from app.graph.types import ChatContext
from app.models.chat_messages import ChatMessage
from app.models.users import User
from app.repositories import complaint_repository
from app.schemas.chat_message import ChatMessageRead, ChatResponse

async def ask_question(
    db: AsyncSession,
    complaint_id: UUID,
    question: str,
    current_user: User,
) -> ChatResponse:
    """
    Answers user questions strictly grounded on a specific complaint record and its attached document text.
    Executes RetrieveContextNode -> GenerateAnswerNode and saves the Q&A turn to database.
    """
    # 1. Fetch complaint record
    complaint = await complaint_repository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found",
        )

    # 2. Extract document text from attached documents or fallback to complaint description
    doc_text_parts = []
    if complaint.documents:
        for doc in complaint.documents:
            if doc.raw_extracted_text:
                doc_text_parts.append(doc.raw_extracted_text)
    
    document_text = "\n\n".join(doc_text_parts) if doc_text_parts else (complaint.complaint_description or "No raw document text available.")

    # 3. Retrieve past chat history (USER first, then ASSISTANT for equal timestamps)
    sender_priority = case((ChatMessage.sender == "USER", 0), else_=1)
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.complaint_id == complaint_id)
        .order_by(ChatMessage.created_at.asc(), sender_priority.asc(), ChatMessage.id.asc())
    )
    history_res = await db.execute(stmt)
    existing_messages = list(history_res.scalars().all())

    chat_history: List[ChatContext] = [
        {
            "role": msg.sender,
            "content": msg.message_text,
            "timestamp": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in existing_messages
    ]

    # 4. Construct ComplaintGraphState
    state: ComplaintGraphState = {
        "complaint_id": complaint.id,
        "user_id": current_user.id,
        "raw_document_text": document_text,
        "validated_fields": {
            "customer_name": complaint.customer_name,
            "product_name": complaint.product_name,
            "batch_number": complaint.batch_number,
            "strength_grade": complaint.strength_grade,
            "complaint_type": complaint.complaint_type,
            "complaint_description": complaint.complaint_description,
            "severity": complaint.severity.value if complaint.severity else "N/A",
        },
        "risk_level": complaint.risk_level.value if complaint.risk_level else "N/A",
        "ai_summary": complaint.ai_summary or "",
        "chat_history": chat_history,
        "current_question": question.strip(),
        "errors": [],
    }

    # 5. Execute Nodes: RetrieveContextNode -> GenerateAnswerNode
    context_update = await retrieve_context_node(state)
    state.update(context_update)

    answer_update = await generate_answer_node(state)
    state.update(answer_update)

    answer_text = state.get("current_answer", "I couldn't find that information in the complaint or uploaded documents.")

    # 6. Save Q&A turn into chat_messages table with explicit chronological separation
    now = datetime.now(timezone.utc)
    user_msg = ChatMessage(
        complaint_id=complaint_id,
        user_id=current_user.id,
        sender="USER",
        message_text=question.strip(),
        created_at=now,
    )
    db.add(user_msg)

    assistant_msg = ChatMessage(
        complaint_id=complaint_id,
        user_id=current_user.id,
        sender="ASSISTANT",
        message_text=answer_text,
        created_at=now + timedelta(milliseconds=10),
    )
    db.add(assistant_msg)

    await db.commit()

    # 7. Return ChatResponse
    return ChatResponse(
        answer=answer_text,
        complaint_id=complaint_id,
    )

async def get_chat_history(
    db: AsyncSession,
    complaint_id: UUID,
    current_user: User,
) -> List[ChatMessageRead]:
    """
    Retrieves full chronological message history for a specific complaint.
    Ensures USER messages always precede ASSISTANT responses.
    """
    complaint = await complaint_repository.get_by_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found",
        )

    sender_priority = case((ChatMessage.sender == "USER", 0), else_=1)
    stmt = (
        select(ChatMessage)
        .where(ChatMessage.complaint_id == complaint_id)
        .order_by(ChatMessage.created_at.asc(), sender_priority.asc(), ChatMessage.id.asc())
    )
    result = await db.execute(stmt)
    messages = list(result.scalars().all())

    return [ChatMessageRead.model_validate(msg) for msg in messages]
