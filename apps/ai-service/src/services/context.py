import httpx
import time
from typing import Any
from dataclasses import dataclass

from src.config import settings


@dataclass
class PortfolioContext:
    projects: list[dict]
    skills: list[dict]
    experience: list[dict]
    categories: list[dict]
    fetched_at: float


_cached_context: PortfolioContext | None = None


async def fetch_from_api(endpoint: str) -> list[dict]:
    """Fetch data from API Gateway."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{settings.api_gateway_url}{endpoint}")
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
    except Exception as e:
        print(f"Error fetching {endpoint}: {e}")
        return []


async def get_portfolio_context() -> PortfolioContext:
    """
    Fetch portfolio data from API Gateway with caching.
    Data is cached for 5 minutes to avoid hitting the API on every request.
    """
    global _cached_context
    
    current_time = time.time()
    
    if _cached_context and (current_time - _cached_context.fetched_at) < settings.context_cache_ttl:
        return _cached_context
    
    print("Fetching fresh portfolio context from API Gateway...")
    
    projects = await fetch_from_api("/api/projects")
    skills = await fetch_from_api("/api/skills")
    experience = await fetch_from_api("/api/experience")
    categories = await fetch_from_api("/api/categories")
    
    _cached_context = PortfolioContext(
        projects=projects,
        skills=skills,
        experience=experience,
        categories=categories,
        fetched_at=current_time,
    )
    
    print(f"Context loaded: {len(projects)} projects, {len(skills)} skills, {len(experience)} experiences")
    
    return _cached_context


def invalidate_context_cache():
    """Invalidate the cached context (call when data is updated)."""
    global _cached_context
    _cached_context = None


def format_projects_by_category(context: PortfolioContext) -> str:
    """Format projects grouped by category."""
    if not context.projects:
        return "No projects available."
    
    category_map = {cat["id"]: cat for cat in context.categories}
    projects_by_category: dict[str, list[dict]] = {}
    
    for project in context.projects:
        cat_id = project.get("categoryId")
        cat_name = category_map.get(cat_id, {}).get("name", "Other") if cat_id else "Other"
        
        if cat_name not in projects_by_category:
            projects_by_category[cat_name] = []
        projects_by_category[cat_name].append(project)
    
    lines = []
    for category, projects in projects_by_category.items():
        lines.append(f"\n### {category} ({len(projects)} projects)")
        for p in projects:
            tech = ", ".join(p.get("techStack", [])[:4])
            desc = p.get("description", "")[:100]
            lines.append(f"- **{p.get('title')}**: {desc}")
            if tech:
                lines.append(f"  Tech: {tech}")
            if p.get("githubUrl"):
                lines.append(f"  GitHub: {p.get('githubUrl')}")
            if p.get("liveUrl"):
                lines.append(f"  Live: {p.get('liveUrl')}")
    
    return "\n".join(lines)


def format_skills_by_category(context: PortfolioContext) -> str:
    """Format skills grouped by category."""
    if not context.skills:
        return "No skills available."
    
    skills_by_category: dict[str, list[dict]] = {}
    
    for skill in context.skills:
        cat = skill.get("category", "Other")
        if cat not in skills_by_category:
            skills_by_category[cat] = []
        skills_by_category[cat].append(skill)
    
    lines = []
    for category, skills in skills_by_category.items():
        skill_names = [f"{s.get('name')} ({s.get('proficiency', 0)}%)" for s in skills]
        lines.append(f"- **{category.title()}**: {', '.join(skill_names)}")
    
    return "\n".join(lines)


def format_experience(context: PortfolioContext) -> str:
    """Format work experience."""
    if not context.experience:
        return "No experience available."
    
    lines = []
    for exp in sorted(context.experience, key=lambda x: x.get("startDate", ""), reverse=True):
        role = exp.get("role", "")
        company = exp.get("company", "")
        is_current = exp.get("isCurrent", False)
        start = exp.get("startDate", "")[:7] if exp.get("startDate") else ""
        end = "Present" if is_current else (exp.get("endDate", "")[:7] if exp.get("endDate") else "")
        
        lines.append(f"- **{role}** at {company} ({start} - {end})")
        
        if exp.get("description"):
            lines.append(f"  {exp.get('description')[:150]}...")
        
        tech = exp.get("techStack", [])
        if tech:
            lines.append(f"  Technologies: {', '.join(tech[:6])}")
    
    return "\n".join(lines)
