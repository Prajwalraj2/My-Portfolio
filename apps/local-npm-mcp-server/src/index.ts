// prajwalraj-mcp — a stdio MCP server exposing Prajwal Raj's portfolio tools to MCP clients
// (Cursor, Claude Desktop, Claude Code). Talks to the API Gateway with the user's pk_live_ key.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config";
import { registerContentTools } from "./tools/content";
import { registerMeetingTools } from "./tools/meetings";

async function main(): Promise<void> {
  const server = new McpServer({ name: "prajwalraj-mcp", version: "0.1.0" });

  registerContentTools(server);
  registerMeetingTools(server);

  // IMPORTANT: stdout is the JSON-RPC channel. All logs/diagnostics MUST go to stderr.
  console.error(`[prajwalraj-mcp] gateway=${config.apiBase} · apiKey=${config.apiKey ? "set" : "MISSING"}`);
  if (!config.apiKey) {
    console.error(
      "[prajwalraj-mcp] ⚠ No PRAJWAL_API_KEY set — tools will not run. " +
        "Create a free key at https://prajwalraj.com/mcp and add it to your MCP config."
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[prajwalraj-mcp] ready (stdio)");
}

main().catch((err) => {
  console.error("[prajwalraj-mcp] fatal:", err);
  process.exit(1);
});
