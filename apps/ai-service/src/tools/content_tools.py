"""Read tools — thin wrappers over the gateway's public content endpoints.

Each returns a compact, LLM-friendly string. Tools emit progress so the user sees activity.
"""
import json

from langchain.tools import tool

from src.tools.gateway import gateway_get, emit_progress


@tool
async def get_projects(category: str | None = None) -> str:
    """Get Prajwal's portfolio projects. Optionally filter by a category slug.
    Use when the user asks about his projects, work, or what he has built."""
    emit_progress("Looking up projects…")
    params = {"category": category} if category else None
    data = (await gateway_get("/api/projects", params)).get("data", [])
    if not data:
        return "No projects found."
    lines = []
    for p in data:
        tech = ", ".join(p.get("techStack", [])[:5])
        lines.append(
            f"- {p.get('title')}: {(p.get('description') or '')[:160]}"
            + (f" [tech: {tech}]" if tech else "")
            + (f" [github: {p.get('githubUrl')}]" if p.get("githubUrl") else "")
            + (f" [live: {p.get('liveUrl')}]" if p.get("liveUrl") else "")
        )
    return "\n".join(lines)


@tool
async def get_skills() -> str:
    """Get Prajwal's technical skills grouped by category (frontend, backend, devops, ai, …)."""
    emit_progress("Looking up skills…")
    data = (await gateway_get("/api/skills/grouped")).get("data", {})
    if not data:
        return "No skills found."
    lines = []
    for category, skills in data.items():
        names = ", ".join(f"{s.get('name')} ({s.get('proficiency')}%)" for s in skills)
        lines.append(f"- {category}: {names}")
    return "\n".join(lines)


@tool
async def get_experience() -> str:
    """Get Prajwal's work experience (companies, roles, dates, tech)."""
    emit_progress("Looking up experience…")
    data = (await gateway_get("/api/experience")).get("data", [])
    if not data:
        return "No experience found."
    lines = []
    for e in data:
        end = "Present" if e.get("isCurrent") else (e.get("endDate") or "")[:7]
        lines.append(
            f"- {e.get('role')} at {e.get('company')} ({(e.get('startDate') or '')[:7]} – {end})"
            + (f": {(e.get('description') or '')[:160]}" if e.get("description") else "")
        )
    return "\n".join(lines)


@tool
async def get_github() -> str:
    """Get Prajwal's live GitHub stats: profile, top repositories, languages, total stars.
    Use when asked about his open-source work, repos, or GitHub activity."""
    emit_progress("Fetching GitHub data…")
    data = (await gateway_get("/api/github")).get("data", {})
    if not data:
        return "GitHub data is unavailable."
    profile = data.get("profile", {})
    totals = data.get("totals", {})
    langs = ", ".join(f"{k} ({v})" for k, v in list(data.get("languages", {}).items())[:6])
    repos = "\n".join(
        f"  - {r.get('name')} ⭐{r.get('stars')}: {(r.get('description') or '')[:100]}"
        for r in data.get("topRepos", [])[:8]
    )
    return (
        f"GitHub: {profile.get('login')} — {profile.get('publicRepos')} repos, "
        f"{totals.get('stars')} total stars, {profile.get('followers')} followers.\n"
        f"Languages: {langs}\nTop repos:\n{repos}"
    )


@tool
async def get_portfolio() -> str:
    """Get a full portfolio snapshot (profile/bio, featured projects, top skills, experience,
    resume). Good for a general 'tell me about Prajwal' overview."""
    emit_progress("Gathering portfolio overview…")
    data = (await gateway_get("/api/portfolio")).get("data", {})
    return json.dumps(data, default=str)[:4000]


@tool
async def get_guides() -> str:
    """List Prajwal's how-to guides (e.g. how to use his Remote MCP server)."""
    emit_progress("Looking up guides…")
    data = (await gateway_get("/api/guides")).get("data", [])
    if not data:
        return "No guides found."
    return "\n".join(f"- {g.get('title')} ({g.get('slug')}): {g.get('summary') or ''}" for g in data)
