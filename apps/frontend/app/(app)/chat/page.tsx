import type { Metadata } from "next";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Chat with Lisa" };

export default function ChatPage() {
  return <ChatWorkspace />;
}
