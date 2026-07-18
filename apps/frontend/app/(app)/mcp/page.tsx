import type { Metadata } from "next";
import { ApiKeysManager } from "@/components/dashboard/api-keys-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "API Keys" };

export default function McpPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">API Keys</h1>
      <p className="mt-1 text-muted-foreground">
        Create keys to use Prajwal&apos;s tools from the local MCP server in Cursor or Claude
        Desktop. Keep them secret — treat them like passwords.
      </p>
      <div className="mt-8">
        <ApiKeysManager />
      </div>
    </div>
  );
}
