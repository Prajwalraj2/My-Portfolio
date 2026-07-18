// Compact, LLM-friendly formatters — ported from the ai-service tool wrappers so the MCP
// output matches what "Lisa" produces. Inputs are the gateway's already-unwrapped `data`.

/* eslint-disable @typescript-eslint/no-explicit-any */

const trunc = (s: unknown, n: number) => String(s ?? "").slice(0, n);

export function formatProjects(data: any[]): string {
  if (!data?.length) return "No projects found.";
  return data
    .map((p) => {
      const tech = (p.techStack ?? []).slice(0, 5).join(", ");
      return (
        `- ${p.title}: ${trunc(p.description, 160)}` +
        (tech ? ` [tech: ${tech}]` : "") +
        (p.githubUrl ? ` [github: ${p.githubUrl}]` : "") +
        (p.liveUrl ? ` [live: ${p.liveUrl}]` : "")
      );
    })
    .join("\n");
}

export function formatSkills(data: Record<string, any[]>): string {
  const entries = Object.entries(data ?? {});
  if (!entries.length) return "No skills found.";
  return entries
    .map(([category, skills]) => {
      const names = (skills ?? []).map((s) => `${s.name} (${s.proficiency}%)`).join(", ");
      return `- ${category}: ${names}`;
    })
    .join("\n");
}

export function formatExperience(data: any[]): string {
  if (!data?.length) return "No experience found.";
  return data
    .map((e) => {
      const end = e.isCurrent ? "Present" : trunc(e.endDate, 7);
      return (
        `- ${e.role} at ${e.company} (${trunc(e.startDate, 7)} – ${end})` +
        (e.description ? `: ${trunc(e.description, 160)}` : "")
      );
    })
    .join("\n");
}

export function formatGithub(data: any): string {
  if (!data || !Object.keys(data).length) return "GitHub data is unavailable.";
  const profile = data.profile ?? {};
  const totals = data.totals ?? {};
  const langs = Object.entries(data.languages ?? {})
    .slice(0, 6)
    .map(([k, v]) => `${k} (${v})`)
    .join(", ");
  const repos = (data.topRepos ?? [])
    .slice(0, 8)
    .map((r: any) => `  - ${r.name} ⭐${r.stars}: ${trunc(r.description, 100)}`)
    .join("\n");
  return (
    `GitHub: ${profile.login} — ${profile.publicRepos} repos, ${totals.stars} total stars, ` +
    `${profile.followers} followers.\nLanguages: ${langs}\nTop repos:\n${repos}`
  );
}

export function formatGuides(data: any[]): string {
  if (!data?.length) return "No guides found.";
  return data.map((g) => `- ${g.title} (${g.slug}): ${g.summary ?? ""}`).join("\n");
}

export function formatSlots(data: any, tz: string, daysAhead: number): string {
  const slots = data && typeof data === "object" ? data.slots ?? {} : {};
  const days = Object.entries(slots) as [string, any[]][];
  if (!days.length) return `No available slots in the next ${daysAhead} days.`;
  const lines = [`Available times (timezone: ${tz}):`];
  for (const [day, items] of days.slice(0, 6)) {
    const times = (items ?? [])
      .slice(0, 6)
      .map((s: any) => s.start ?? s.time ?? "")
      .join(", ");
    lines.push(`- ${day}: ${times}`);
  }
  return lines.join("\n");
}
