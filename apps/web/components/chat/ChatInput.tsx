"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-border bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
            disabled={isLoading}
          />
        </div>
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white transition-colors hover:bg-red-600"
            title="Stop generating"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
