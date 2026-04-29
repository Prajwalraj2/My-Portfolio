from pydantic import BaseModel, Field
from typing import Literal


class ChatMessage(BaseModel):
    """A single chat message."""
    role: Literal["user", "assistant"] = Field(
        description="The role of the message sender"
    )
    content: str = Field(
        description="The content of the message",
        min_length=1,
        max_length=10000,
    )


class ChatRequest(BaseModel):
    """Request body for chat endpoints."""
    messages: list[ChatMessage] = Field(
        description="List of messages in the conversation",
        min_length=1,
    )
    session_id: str | None = Field(
        default=None,
        description="Optional session ID for conversation continuity",
    )


class ChatStreamEvent(BaseModel):
    """A single SSE event in the chat stream."""
    event: Literal["delta", "done", "error"]
    data: dict


class ChatCompleteResponse(BaseModel):
    """Response for non-streaming chat endpoint."""
    content: str
    session_id: str | None
    tokens_used: int
