"use client";

import { Sparkles, User } from "lucide-react";
import type { Message } from "./ChatContainer";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-foreground text-background" : "bg-accent/10"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-accent" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-foreground text-background"
            : "bg-muted text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-accent" />
          )}
        </div>
      </div>
    </div>
  );
}
