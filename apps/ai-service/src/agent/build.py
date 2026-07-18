"""Builds the shared portfolio agent (LangChain create_agent). Stateless — no checkpointer
(prompt-based confirmation for now; enforced HITL + checkpointer comes later)."""
import os

from langchain.agents import create_agent

from src.config import settings
from src.tools import ALL_TOOLS
from src.agent.middleware import build_middleware

# init_chat_model (used by create_agent) reads the key from the environment.
if settings.openai_api_key:
    os.environ.setdefault("OPENAI_API_KEY", settings.openai_api_key)

_agent = None


def get_agent():
    """Lazily create and cache the agent (one instance for the process)."""
    global _agent
    if _agent is None:
        _agent = create_agent(
            model=settings.model_string,
            tools=ALL_TOOLS,
            middleware=build_middleware(),
        )
    return _agent
