import { ChatContainer } from "@/components/chat/ChatContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat with AI Assistant",
  description: "Ask questions about Prajwal's work, skills, and experience",
};

export default function ChatPage() {
  return <ChatContainer />;
}
