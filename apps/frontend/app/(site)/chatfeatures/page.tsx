import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ChatPanel } from "@/components/chat/chat-panel";

export const metadata: Metadata = {
  title: "Chat Features",
  description: "Meet Lisa — Prajwal's AI assistant. Ask about his work, book a call, or send a message.",
};

const CAPABILITIES = [
  { title: "Explore his work", body: "Ask about projects, skills, experience, or his live GitHub." },
  { title: "Book a call", body: "Lisa shows real availability and books a meeting for you." },
  { title: "Get in touch", body: "Send Prajwal a message or a project inquiry, right from the chat." },
  { title: "Guides & docs", body: "Ask how to use his Remote MCP server and other how-tos." },
];

export default function ChatFeaturesPage() {
  return (
    <Container className="py-16 md:py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Meet Lisa</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Prajwal&apos;s AI assistant. She can act on your behalf — no login needed.
      </p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="rounded-xl border p-5">
              <h2 className="font-heading font-medium">{c.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="h-[560px] overflow-hidden rounded-2xl border bg-card shadow-sm">
          <ChatPanel />
        </div>
      </div>
    </Container>
  );
}
