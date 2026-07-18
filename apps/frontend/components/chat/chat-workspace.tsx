"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatPanel, type UiMessage } from "./chat-panel";
import {
  listChatSessions,
  getChatSession,
  persistChatTurn,
  renameChatSession,
  deleteChatSession,
  type ChatSessionSummary,
} from "@/lib/chat-history";

export function ChatWorkspace() {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<UiMessage[]>([]);
  const [panelKey, setPanelKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  async function refreshSessions() {
    try {
      setSessions(await listChatSessions());
    } catch {
      /* keep whatever we have */
    }
  }

  useEffect(() => {
    void refreshSessions();
  }, []);

  function newChat() {
    setActiveId(null);
    setInitialMessages([]);
    setPanelKey((k) => k + 1);
  }

  async function selectSession(id: string) {
    if (id === activeId || loading) return;
    setLoading(true);
    try {
      const detail = await getChatSession(id);
      setInitialMessages(
        detail.messages.map((m) => ({ role: m.role, content: m.content }))
      );
      setActiveId(id);
      setPanelKey((k) => k + 1);
    } catch {
      /* ignore — leave current conversation as-is */
    } finally {
      setLoading(false);
    }
  }

  function startRename(s: ChatSessionSummary) {
    setEditingId(s.id);
    setEditTitle(s.title ?? "");
  }

  async function saveRename(id: string) {
    const title = editTitle.trim();
    setEditingId(null);
    const current = sessions.find((s) => s.id === id);
    if (!title || title === current?.title) return;
    // Optimistic; reconcile from the server afterwards.
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
    try {
      await renameChatSession(id, title);
    } finally {
      void refreshSessions();
    }
  }

  async function removeSession(s: ChatSessionSummary) {
    if (!window.confirm(`Delete "${s.title ?? "this chat"}"? This can't be undone.`)) return;
    setSessions((prev) => prev.filter((x) => x.id !== s.id));
    if (s.id === activeId) newChat();
    try {
      await deleteChatSession(s.id);
    } finally {
      void refreshSessions();
    }
  }

  async function handleTurnComplete(userText: string, assistantText: string) {
    try {
      const { sessionId } = await persistChatTurn({
        sessionId: activeId,
        userMessage: userText,
        assistantMessage: assistantText,
      });
      // Adopt the new session id WITHOUT remounting the panel (keep the streamed messages).
      if (!activeId) setActiveId(sessionId);
      void refreshSessions();
    } catch {
      /* persistence is best-effort — never break the live chat */
    }
  }

  return (
    // Pin to the viewport minus the dashboard header (4rem) and the content padding
    // (p-6 → 3rem) so only the message list scrolls and the input stays anchored.
    <div className="flex h-[calc(100svh-7rem)] min-h-0 gap-4">
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border md:flex">
        <div className="p-2">
          <Button onClick={newChat} variant="outline" className="w-full justify-start gap-2">
            <Plus className="size-4" />
            New chat
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2 pt-0">
          {sessions.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No conversations yet. Say hi to Lisa.
            </p>
          ) : (
            sessions.map((s) =>
              editingId === s.id ? (
                <div key={s.id} className="flex items-center gap-1 px-1 py-0.5">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(s.id);
                      else if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => saveRename(s.id)}
                    className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring"
                  />
                  <button
                    type="button"
                    aria-label="Save"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => saveRename(s.id)}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setEditingId(null)}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  key={s.id}
                  className={cn(
                    "group/row flex items-center gap-1 rounded-md pr-1 transition-colors",
                    s.id === activeId
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <button
                    onClick={() => selectSession(s.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm",
                      s.id === activeId && "font-medium"
                    )}
                  >
                    <MessageSquare className="size-4 shrink-0" />
                    <span className="truncate">{s.title ?? "New chat"}</span>
                  </button>
                  <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label="Rename chat"
                      onClick={() => startRename(s)}
                      className="rounded p-1 hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete chat"
                      onClick={() => removeSession(s)}
                      className="rounded p-1 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </aside>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border">
        <ChatPanel
          key={panelKey}
          initialMessages={initialMessages}
          onTurnComplete={handleTurnComplete}
        />
      </div>
    </div>
  );
}
