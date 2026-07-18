// Browser SSE client for the chat. POSTs through the BFF proxy → gateway → ai-service,
// and parses the sse-starlette event stream (event: delta|progress|done|error).

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface StreamChatOptions {
  messages: ChatMessage[];
  timeZone?: string;
  sessionId?: string | null;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  onProgress?: (message: string) => void;
  onDone?: (data: unknown) => void;
  onError?: (message: string) => void;
}

export async function streamChat(opts: StreamChatOptions): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/proxy/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: opts.messages,
        session_id: opts.sessionId ?? null,
        time_zone: opts.timeZone,
      }),
      signal: opts.signal,
    });
  } catch (err) {
    opts.onError?.(err instanceof Error ? err.message : "Network error");
    return;
  }

  if (!res.ok || !res.body) {
    opts.onError?.(`Chat request failed (${res.status})`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Normalize CRLF → LF (sse-starlette uses \r\n separators) on the whole buffer,
    // so a \r\n split across chunk boundaries is still handled.
    buffer = buffer.replace(/\r\n/g, "\n");

    // SSE events are separated by a blank line.
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      if (!chunk.trim()) continue;
      let event = "message";
      let data = "";
      for (const line of chunk.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      let parsed: { content?: string; message?: string; error?: string };
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "delta") opts.onDelta(parsed.content ?? "");
      else if (event === "progress") opts.onProgress?.(parsed.message ?? "");
      else if (event === "done") opts.onDone?.(parsed);
      else if (event === "error") opts.onError?.(parsed.error ?? "Something went wrong");
    }
  }
}
