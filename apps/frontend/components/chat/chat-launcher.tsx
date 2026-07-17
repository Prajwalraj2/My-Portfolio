"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatPanel } from "./chat-panel";
import { useChat } from "./chat-provider";

// Only hidden where a chat is already embedded on the page.
const HIDDEN_ON = new Set<string>(["/chatfeatures"]);

export function ChatLauncher() {
  const pathname = usePathname();
  const { open, openChat, closeChat } = useChat();

  if (HIDDEN_ON.has(pathname)) return null;

  return open ? (
    <div className="fixed right-4 bottom-4 z-50 flex h-[560px] max-h-[calc(100vh-2rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="font-heading text-sm font-semibold">
          Lisa · Prajwal&apos;s assistant
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Close chat" onClick={closeChat}>
          <X />
        </Button>
      </div>
      <ChatPanel className="flex-1" />
    </div>
  ) : (
    <Button
      size="icon-lg"
      aria-label="Chat with Lisa"
      onClick={openChat}
      className="fixed right-6 bottom-6 z-50 rounded-full shadow-lg"
    >
      <MessageCircle />
    </Button>
  );
}
