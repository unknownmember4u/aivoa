from datetime import datetime
from uuid import UUID
from pydantic import Field

from app.schemas.base import BaseSchema

class ChatMessageBase(BaseSchema):
    message_text: str = Field(..., min_length=1, description="Message content")

class ChatMessageCreate(ChatMessageBase):
    sender: str = Field(..., pattern="^(USER|ASSISTANT)$")

class ChatMessageRead(ChatMessageBase):
    id: UUID
    complaint_id: UUID
    user_id: UUID
    sender: str
    created_at: datetime

class ChatRequest(BaseSchema):
    question: str = Field(..., min_length=1, description="Question asked to AI Assistant")

class ChatResponse(BaseSchema):
    answer: str = Field(..., min_length=1)
    complaint_id: UUID
    created_at: datetime = Field(default_factory=datetime.utcnow)
