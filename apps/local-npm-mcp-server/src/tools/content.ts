// Read tools — thin wrappers over the gateway's public content endpoints. Mirrors
// apps/ai-service/src/tools/content_tools.py so behavior matches "Lisa".
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { gatewayGet, unwrap } from "../gateway";
import { safe } from "../result";
import {
  formatProjects,
  formatSkills,
  formatExperience,
  formatGithub,
  formatGuides,
} from "../format";

export function registerContentTools(server: McpServer): void {
  server.tool(
    "get_projects",
    "Get Prajwal's portfolio projects. Optionally filter by a category slug. Use when the user asks about his projects, work, or what he has built.",
    { category: z.string().optional().describe("Category slug to filter by, e.g. 'devops'.") },
    ({ category }) =>
      safe(async () =>
        formatProjects(unwrap(await gatewayGet("/api/projects", category ? { category } : undefined), []))
      )
  );

  server.tool(
    "get_skills",
    "Get Prajwal's technical skills grouped by category (frontend, backend, devops, ai, database, …).",
    () => safe(async () => formatSkills(unwrap(await gatewayGet("/api/skills/grouped"), {})))
  );

  server.tool(
    "get_experience",
    "Get Prajwal's work experience (companies, roles, dates, tech stack).",
    () => safe(async () => formatExperience(unwrap(await gatewayGet("/api/experience"), [])))
  );

  server.tool(
    "get_github",
    "Get Prajwal's live GitHub stats: profile, top repositories, languages, and total stars. Use when asked about his open-source work, repos, or GitHub activity.",
    () => safe(async () => formatGithub(unwrap(await gatewayGet("/api/github"), {})))
  );

  server.tool(
    "get_portfolio",
    "Get a full portfolio snapshot (profile/bio, featured projects, top skills, experience, resume). Good for a general 'tell me about Prajwal' overview.",
    () =>
      safe(async () =>
        JSON.stringify(unwrap(await gatewayGet("/api/portfolio"), {})).slice(0, 4000)
      )
  );

  server.tool(
    "get_guides",
    "List Prajwal's how-to guides (e.g. how to use his MCP server).",
    () => safe(async () => formatGuides(unwrap(await gatewayGet("/api/guides"), [])))
  );
}
