"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { streamChat } from "@/lib/chat";

export interface UiMessage {
  role: "user" | "assistant";
  content: string;
  steps?: string[];
}

interface ChatPanelProps {
  className?: string;
  /** Seed the panel with a past conversation (history). */
  initialMessages?: UiMessage[];
  /** Fired after a turn streams successfully — used to persist history. */
  onTurnComplete?: (userText: string, assistantText: string, steps: string[]) => void;
}

const SUGGESTIONS = [
  "What has Prajwal built with Kubernetes?",
  "I'd like to book a call with Prajwal",
  "Show me his GitHub",
  "I want to hire him for a project",
];

export function ChatPanel({ className, initialMessages, onTurnComplete }: ChatPanelProps) {
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "sess"
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function updateLast(fn: (m: UiMessage) => UiMessage) {
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    const history: UiMessage[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "", steps: [] }]);
    setInput("");
    setStreaming(true);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let assistantText = "";
    const stepsAcc: string[] = [];
    let errored = false;

    await streamChat({
      messages: history.map(({ role, content }) => ({ role, content })),
      timeZone,
      sessionId,
      onDelta: (t) => {
        assistantText += t;
        updateLast((m) => ({ ...m, content: m.content + t }));
      },
      onProgress: (msg) => {
        stepsAcc.push(msg);
        updateLast((m) => ({ ...m, steps: [...(m.steps ?? []), msg] }));
      },
      onDone: () => setStreaming(false),
      onError: (e) => {
        errored = true;
        updateLast((m) => {
          setStreaming(false);
          return { ...m, content: m.content || `⚠️ ${e}` };
        });
      },
    });
    setStreaming(false);

    if (!errored && assistantText.trim()) {
      onTurnComplete?.(content, assistantText, stepsAcc);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {empty ? (
          <div className="flex h-full flex-col justify-center">
            <p className="font-heading text-lg font-semibold">
              Hi, I&apos;m Lisa — Prajwal&apos;s assistant.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ask me anything about Prajwal, or let me book a call or pass along a message.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              const isLast = i === messages.length - 1;
              const hasSteps = !isUser && m.steps && m.steps.length > 0;
              return (
                <div key={i} className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    )}
                  >
                    {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm [&>*:last-child]:mb-0",
                      isUser
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted"
                    )}
                  >
                    {hasSteps ? (
                      <details className="group mb-2" open={isLast && streaming && !m.content}>
                        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground">
                          <ChevronRight className="size-3 transition-transform group-open:rotate-90" />
                          {isLast && streaming
                            ? `${m.steps![m.steps!.length - 1]}…`
                            : `Lisa's steps (${m.steps!.length})`}
                        </summary>
                        <ul className="mt-1 space-y-0.5 pl-4 text-xs text-muted-foreground">
                          {m.steps!.map((s, j) => (
                            <li key={j}>• {s}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}

                    {isUser ? (
                      m.content
                    ) : m.content ? (
                      <Markdown content={m.content} />
                    ) : !hasSteps && streaming && isLast ? (
                      <span className="text-muted-foreground">…</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="shrink-0 border-t p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask Lisa anything…"
            className="max-h-32 min-h-9 flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" size="icon" disabled={streaming || !input.trim()} aria-label="Send">
            <ArrowUp />
          </Button>
        </div>
      </form>
    </div>
  );
}
