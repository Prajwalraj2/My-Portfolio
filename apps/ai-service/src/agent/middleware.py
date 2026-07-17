"""Guardrail middleware for the agent. Built defensively — if a middleware's name/args
differ in the installed LangChain version, it's skipped with a log rather than breaking the
whole agent. (HITL is added in a future iteration; it needs a checkpointer + resume flow.)
"""
from src.config import settings


def build_middleware() -> list:
    middleware: list = []

    try:
        from langchain.agents.middleware import ModelCallLimitMiddleware

        middleware.append(
            ModelCallLimitMiddleware(thread_limit=12, run_limit=8, exit_behavior="end")
        )
    except Exception as e:  # pragma: no cover
        print(f"[middleware] ModelCallLimitMiddleware unavailable: {e}")

    try:
        from langchain.agents.middleware import ToolCallLimitMiddleware

        middleware.append(
            ToolCallLimitMiddleware(thread_limit=12, run_limit=8, exit_behavior="end")
        )
    except Exception as e:  # pragma: no cover
        print(f"[middleware] ToolCallLimitMiddleware unavailable: {e}")

    try:
        from langchain.agents.middleware import SummarizationMiddleware

        middleware.append(SummarizationMiddleware(model=settings.model_string))
    except Exception as e:  # pragma: no cover
        print(f"[middleware] SummarizationMiddleware unavailable: {e}")

    return middleware
