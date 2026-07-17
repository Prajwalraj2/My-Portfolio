"""Action (write) tools — thin wrappers over the gateway. The agent is instructed (in the
system prompt) to CONFIRM details with the user before calling book_meeting / send_email.
"""
from datetime import datetime, timedelta, timezone

from langchain.tools import tool

from src.config import settings
from src.tools.gateway import gateway_get, gateway_post, emit_progress


@tool
async def get_meeting_slots(time_zone: str = "", days_ahead: int = 14) -> str:
    """Get Prajwal's available meeting slots for the next `days_ahead` days (default 14),
    shown in the given IANA `time_zone` (e.g. 'Asia/Kolkata', 'America/New_York').
    Call this PROACTIVELY the moment a user wants to meet — the window is computed for you,
    so just present the returned times as options to pick from. Re-call with a different
    time_zone if the user is elsewhere."""
    tz = time_zone or settings.default_timezone
    emit_progress("Checking Prajwal's availability…")
    now = datetime.now(timezone.utc)
    params = {
        "startTime": now.isoformat(),
        "endTime": (now + timedelta(days=days_ahead)).isoformat(),
        "timeZone": tz,
    }
    data = (await gateway_get("/api/meetings/slots", params)).get("data", {})
    slots = data.get("slots", {}) if isinstance(data, dict) else {}
    if not slots:
        return f"No available slots in the next {days_ahead} days."
    lines = [f"Available times (timezone: {tz}):"]
    for day, items in list(slots.items())[:6]:
        times = ", ".join(s.get("start", s.get("time", "")) for s in items[:6])
        lines.append(f"- {day}: {times}")
    return "\n".join(lines)


@tool
async def book_meeting(start: str, name: str, email: str, time_zone: str, topic: str = "") -> str:
    """Book a meeting with Prajwal at a specific available slot.
    ONLY call this AFTER: (1) you showed real slots via get_meeting_slots, (2) the user chose
    an exact time, and (3) the user confirmed and gave their name + email. `start` must be an
    ISO 8601 slot returned by get_meeting_slots."""
    emit_progress("Booking your meeting…")
    res = await gateway_post(
        "/api/meetings",
        {"start": start, "name": name, "email": email, "timeZone": time_zone, "topic": topic},
    )
    m = res.get("data", {})
    return (
        f"Meeting booked for {m.get('startTime')}. A confirmation email with the joining link "
        f"was sent to {email}."
    )


@tool
async def send_email_to_prajwal(name: str, email: str, subject: str, message: str) -> str:
    """Send a direct message/email to Prajwal on the user's behalf.
    Confirm the message content with the user before sending."""
    emit_progress("Sending your message to Prajwal…")
    await gateway_post(
        "/api/email/contact",
        {"name": name, "email": email, "subject": subject, "message": message},
    )
    return "Your message has been sent to Prajwal. He'll get back to you soon."


@tool
async def submit_inquiry(
    name: str,
    email: str,
    description: str,
    company: str | None = None,
    budget: str | None = None,
    timeline: str | None = None,
) -> str:
    """Submit a project / hiring inquiry to Prajwal (for freelance work, jobs, collaborations).
    Gather the details conversationally first."""
    emit_progress("Submitting your inquiry…")
    payload = {"name": name, "email": email, "description": description, "source": "agent"}
    if company:
        payload["company"] = company
    if budget:
        payload["budget"] = budget
    if timeline:
        payload["timeline"] = timeline
    await gateway_post("/api/inquiries", payload)
    return "Your inquiry has been submitted. Prajwal has been notified and will reach out."


@tool
async def leave_recommendation(
    author_name: str,
    content: str,
    rating: int | None = None,
    author_role: str | None = None,
    author_company: str | None = None,
) -> str:
    """Record a testimonial / recommendation for Prajwal. It goes to a pending queue for his
    approval before appearing publicly. Confirm the wording with the user first."""
    emit_progress("Recording your recommendation…")
    payload = {"authorName": author_name, "content": content, "source": "agent"}
    if rating is not None:
        payload["rating"] = rating
    if author_role:
        payload["authorRole"] = author_role
    if author_company:
        payload["authorCompany"] = author_company
    await gateway_post("/api/testimonials", payload)
    return "Thank you! Your recommendation was submitted and will appear after Prajwal approves it."
