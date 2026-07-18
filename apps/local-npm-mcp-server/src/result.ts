// Tool result helpers. Every tool returns MCP text content; errors are surfaced as tool
// errors (isError) with an actionable message rather than crashing the server.
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { GatewayError, hasApiKey } from "./gateway";

const MISSING_KEY_MESSAGE =
  "This server needs a free API key to work. Create one at https://prajwalraj.com/mcp, " +
  "then add it to your MCP config as PRAJWAL_API_KEY and restart your client.";

export function text(body: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text: body }], isError };
}

// Every tool requires a key: no anonymous access, so all MCP traffic is attributed and
// per-key rate-limited, and every advertised capability actually works once a key is set.
export async function safe(fn: () => Promise<string>): Promise<CallToolResult> {
  if (!hasApiKey()) return text(MISSING_KEY_MESSAGE, true);
  try {
    return text(await fn());
  } catch (e) {
    if (e instanceof GatewayError) {
      if (e.status === 401 || e.status === 403) {
        return text(
          `Authorization failed (${e.status}). Check that PRAJWAL_API_KEY is a valid key with the ` +
            `required scope — create or inspect one at https://prajwalraj.com/mcp.`,
          true
        );
      }
      return text(`Gateway error: ${e.message}`, true);
    }
    return text(`Error: ${(e as Error).message}`, true);
  }
}
