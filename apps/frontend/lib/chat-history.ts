// Client helpers for persisted chat history (logged-in users). All go through the BFF proxy.
import { apiFetch } from "./api.client";

export interface ChatSessionSummary {
  id: string;
  title: string | null;
  messageCount: number;
  updatedAt: string;
}

export interface StoredChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSessionDetail {
  id: string;
  title: string | null;
  messages: StoredChatMessage[];
}

export async function listChatSessions(): Promise<ChatSessionSummary[]> {
  const res = await apiFetch<{ data: { sessions: ChatSessionSummary[] } }>("chat/sessions");
  return res.data.sessions;
}

export async function getChatSession(id: string): Promise<ChatSessionDetail> {
  const res = await apiFetch<{ data: ChatSessionDetail }>(`chat/sessions/${id}`);
  return res.data;
}

export async function renameChatSession(id: string, title: string): Promise<void> {
  await apiFetch(`chat/sessions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ title }),
  });
}

export async function deleteChatSession(id: string): Promise<void> {
  await apiFetch(`chat/sessions/${id}`, { method: "DELETE" });
}

export async function persistChatTurn(input: {
  sessionId: string | null;
  userMessage: string;
  assistantMessage: string;
}): Promise<{ sessionId: string; title: string | null }> {
  const res = await apiFetch<{ data: { session_id: string; title: string | null } }>(
    "chat/persist",
    {
      method: "POST",
      body: JSON.stringify({
        session_id: input.sessionId,
        user_message: input.userMessage,
        assistant_message: input.assistantMessage,
      }),
    }
  );
  return { sessionId: res.data.session_id, title: res.data.title };
}
