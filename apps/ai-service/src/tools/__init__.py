"""Tool registry for the portfolio agent."""
from src.tools.content_tools import (
    get_projects,
    get_skills,
    get_experience,
    get_github,
    get_portfolio,
    get_guides,
)
from src.tools.action_tools import (
    get_meeting_slots,
    book_meeting,
    send_email_to_prajwal,
    submit_inquiry,
    leave_recommendation,
)

ALL_TOOLS = [
    # reads
    get_projects,
    get_skills,
    get_experience,
    get_github,
    get_portfolio,
    get_guides,
    # actions
    get_meeting_slots,
    book_meeting,
    send_email_to_prajwal,
    submit_inquiry,
    leave_recommendation,
]

__all__ = ["ALL_TOOLS"]
