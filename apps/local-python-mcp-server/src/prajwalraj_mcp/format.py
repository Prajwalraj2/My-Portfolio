"""Compact, LLM-friendly formatters — ported from the ai-service tool wrappers so the MCP
output matches what "Lisa" produces. Inputs are the gateway's already-unwrapped `data`.
"""
from typing import Any


def _trunc(value: Any, n: int) -> str:
    return str(value or "")[:n]


def format_projects(data: list[dict]) -> str:
    if not data:
        return "No projects found."
    lines = []
    for p in data:
        tech = ", ".join((p.get("techStack") or [])[:5])
        line = f"- {p.get('title')}: {_trunc(p.get('description'), 160)}"
        if tech:
            line += f" [tech: {tech}]"
        if p.get("githubUrl"):
            line += f" [github: {p.get('githubUrl')}]"
        if p.get("liveUrl"):
            line += f" [live: {p.get('liveUrl')}]"
        lines.append(line)
    return "\n".join(lines)


def format_skills(data: dict[str, list]) -> str:
    if not data:
        return "No skills found."
    lines = []
    for category, skills in data.items():
        names = ", ".join(f"{s.get('name')} ({s.get('proficiency')}%)" for s in skills)
        lines.append(f"- {category}: {names}")
    return "\n".join(lines)


def format_experience(data: list[dict]) -> str:
    if not data:
        return "No experience found."
    lines = []
    for e in data:
        end = "Present" if e.get("isCurrent") else _trunc(e.get("endDate"), 7)
        line = f"- {e.get('role')} at {e.get('company')} ({_trunc(e.get('startDate'), 7)} – {end})"
        if e.get("description"):
            line += f": {_trunc(e.get('description'), 160)}"
        lines.append(line)
    return "\n".join(lines)


def format_github(data: dict) -> str:
    if not data:
        return "GitHub data is unavailable."
    profile = data.get("profile", {})
    totals = data.get("totals", {})
    langs = ", ".join(
        f"{k} ({v})" for k, v in list((data.get("languages") or {}).items())[:6]
    )
    repos = "\n".join(
        f"  - {r.get('name')} ⭐{r.get('stars')}: {_trunc(r.get('description'), 100)}"
        for r in (data.get("topRepos") or [])[:8]
    )
    return (
        f"GitHub: {profile.get('login')} — {profile.get('publicRepos')} repos, "
        f"{totals.get('stars')} total stars, {profile.get('followers')} followers.\n"
        f"Languages: {langs}\nTop repos:\n{repos}"
    )


def format_guides(data: list[dict]) -> str:
    if not data:
        return "No guides found."
    return "\n".join(
        f"- {g.get('title')} ({g.get('slug')}): {g.get('summary') or ''}" for g in data
    )


def format_slots(data: Any, tz: str, days_ahead: int) -> str:
    slots = data.get("slots", {}) if isinstance(data, dict) else {}
    if not slots:
        return f"No available slots in the next {days_ahead} days."
    lines = [f"Available times (timezone: {tz}):"]
    for day, items in list(slots.items())[:6]:
        times = ", ".join(s.get("start", s.get("time", "")) for s in (items or [])[:6])
        lines.append(f"- {day}: {times}")
    return "\n".join(lines)
