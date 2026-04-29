"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "./ChatContainer";
import { Sparkles, AlertCircle } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  streamingContent: string;
  isLoading: boolean;
  error: string | null;
}

export function ChatMessages({
  messages,
  streamingContent,
  isLoading,
  error,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <Sparkles className="h-8 w-8 text-accent" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">How can I help you?</h2>
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Ask me anything about Prajwal&apos;s skills, projects, or experience.
          I&apos;m here to help!
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            "What projects has Prajwal built?",
            "What are his technical skills?",
            "Tell me about his experience",
            "What technologies does he use?",
          ].map((suggestion) => (
            <button
              key={suggestion}
              className="rounded-lg border border-border bg-background px-4 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
              onClick={() => {
                const input = document.querySelector(
                  'textarea[placeholder*="message"]'
                ) as HTMLTextAreaElement;
                if (input) {
                  input.value = suggestion;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  input.focus();
                }
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Streaming message */}
          {streamingContent && (
            <ChatMessage
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
                timestamp: new Date(),
              }}
              isStreaming
            />
          )}

          {/* Loading indicator */}
          {isLoading && !streamingContent && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
