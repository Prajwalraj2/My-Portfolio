// Runtime configuration, read once from the environment the MCP client spawns us with.
// PRAJWAL_API_KEY — a `pk_live_` key created at https://prajwalraj.com/mcp (required for writes
//   like book_meeting; reads are public and work without it).
// PRAJWAL_API_BASE — the gateway origin. Defaults to production; override for local dev.

const DEFAULT_API_BASE = "https://api.prajwalraj.com";

export interface Config {
  apiKey: string | undefined;
  apiBase: string;
}

export function loadConfig(): Config {
  const apiBase = (process.env.PRAJWAL_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, "");
  const apiKey = process.env.PRAJWAL_API_KEY?.trim() || undefined;
  return { apiKey, apiBase };
}

export const config = loadConfig();
