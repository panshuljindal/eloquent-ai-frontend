import { BackendMessage, ConversationSummary, Message, Role } from '../types/chat';
import { CHAT_API_BASE as API_BASE, API_BASE_URL } from 'config/env';
import { getFromLocalStorage, LS_KEYS } from '../utils/storage'

function mapBackendMessage(raw: BackendMessage): Message | null {
  if (!raw) return null;
  if (raw.role === 'system') return null;
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    role: (raw.role as Role) ?? 'assistant',
    content: (raw as any).content ?? '',
    createdAt: raw.created_at,
  };
}

export async function fetchConversationList(userId?: string): Promise<ConversationSummary[]> {
  const url = `${API_BASE}/conversations${userId ? `?user_id=${encodeURIComponent(userId)}` : ''}`;
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  const json = await res.json();
  const items = (json?.data?.conversations ?? json?.data?.items ?? json?.items ?? json?.data ?? []) as any[];
  return items.map((c) => ({
    id: String(c.id ?? c.conversation_id ?? ''),
    title: String(c.short_name ?? c.title ?? `Conversation ${c.id ?? c.conversation_id ?? ''}`),
    last_message_preview: c.description ?? c.preview ?? undefined,
    created_at: c.created_at ?? c.updated_at ?? undefined,
  }));
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(`${API_BASE}/messages/${conversationId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch conversation messages');
  const json = await res.json();
  const raw = (json?.data?.messages ?? json?.messages ?? []) as BackendMessage[];
  return raw.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
}

export async function postChatOnce(payload: { conversation_id: string | null; message: string; user_id?: string | null }): Promise<{ conversationId: string; messages: Message[] }> {
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(`${API_BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Chat request failed');
  const json = await res.json();
  const conversationId = String(json?.data?.conversation_id ?? json?.conversation_id ?? '');
  const rawMessages = (json?.data?.messages ?? json?.messages ?? []) as BackendMessage[];
  const mapped = rawMessages.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
  return { conversationId, messages: mapped };
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(`${API_BASE}/delete/${conversationId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function summarizeConversation(conversationId: string): Promise<string> {
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(`${API_BASE}/summarize/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to summarize conversation');
  const json = await res.json();
  const summary = (json?.data?.summary ?? json?.summary ?? '') as string;
  return String(summary);
}

export async function streamChatSSE(
  payload: { conversation_id: string | null; message: string; user_id?: string | null },
  onDelta: (delta: string) => void,
): Promise<{ conversationId: string; messages: Message[] }>
{
  const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
  const res = await fetch(`${API_BASE}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    try {
      const json = await res.json();
      throw new Error(String(json?.message ?? 'Chat stream request failed'));
    } catch {
      throw new Error('Chat stream request failed');
    }
  }

  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const json = await res.json();
    const conversationId = String(json?.data?.conversation_id ?? json?.conversation_id ?? '');
    const rawMessages = (json?.data?.messages ?? json?.messages ?? []) as BackendMessage[];
    const mapped = rawMessages.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
    return { conversationId, messages: mapped };
  }

  if (!res.body) throw new Error('Streaming not supported by browser');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    buffer = buffer.replace(/\r\n/g, '\n');

    const chunks = buffer.split(/\n\n/);
    buffer = chunks.pop() || '';
    for (const chunk of chunks) {
      const lines = chunk.split(/\n/);
      const event = lines.find(l => l.startsWith('event: '))?.slice(7).trim();
      const dataLineRaw = lines.find(l => l.startsWith('data: '))?.slice(6);
      const dataLine = typeof dataLineRaw === 'string' ? dataLineRaw.trim() : undefined;
      if (!dataLine) continue;
      if (event === 'error') {
        try {
          const err = JSON.parse(dataLine);
          throw new Error(String(err?.message ?? 'Streaming error'));
        } catch (e) {
          throw e instanceof Error ? e : new Error('Streaming error');
        }
      } else if (event === 'done') {
        const payload = JSON.parse(dataLine);
        const conversationId = String(payload?.conversation_id ?? '');
        const rawMessages = (payload?.messages ?? []) as BackendMessage[];
        const mapped = rawMessages.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
        return { conversationId, messages: mapped };
      } else {
        const { delta } = JSON.parse(dataLine);
        if (typeof delta === 'string' && delta.length > 0) {
          onDelta(delta);
        }
      }
    }
  }
  return { conversationId: String(payload.conversation_id ?? ''), messages: [] };
}

export function streamChatWebSocket(
  params: { conversationId: string | null; message: string; onDelta: (delta: string) => void }
): Promise<{ conversationId: string; messages: Message[] }>
{
  const { conversationId, message, onDelta } = params;
  return new Promise((resolve, reject) => {
    const wsUrlBase = API_BASE_URL.replace(/^http/, 'ws');
    const token = getFromLocalStorage<string | null>(LS_KEYS.token, null);
    const tokenQs = token ? `?token=${encodeURIComponent(token)}` : '';
    const url = `${wsUrlBase}/api/chat/ws/${conversationId ?? 0}${tokenQs}`;
    const ws = new WebSocket(url);

    let settled = false;

    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({ message }));
      } catch (err) {
        if (!settled) {
          settled = true;
          reject(err);
        }
      }
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.event === 'done') {
          const finalConversationId = String(data?.conversation_id ?? '');
          const rawMessages = (data?.messages ?? []) as BackendMessage[];
          const mapped = rawMessages.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
          ws.close();
          if (!settled) {
            settled = true;
            resolve({ conversationId: finalConversationId, messages: mapped });
          }
          return;
        }
        if (data?.event === 'guardrails') {
          const guardConversationId = String(data?.conversation_id ?? '');
          const rawMessages = (data?.messages ?? []) as BackendMessage[];
          const mapped = rawMessages.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
          ws.close();
          if (!settled) {
            settled = true;
            resolve({ conversationId: guardConversationId, messages: mapped });
          }
          return;
        }
        if (data?.event === 'error') {
          ws.close();
          if (!settled) {
            settled = true;
            reject(new Error(String(data?.message ?? 'WebSocket error')));
          }
          return;
        }
      } catch {
        if (typeof e.data === 'string' && e.data.length > 0) onDelta(e.data);
      }
    };

    ws.onerror = () => {
      try { ws.close(); } catch {}
      if (!settled) {
        settled = true;
        reject(new Error('WebSocket error'));
      }
    };

    ws.onclose = () => {
      if (!settled) {
        settled = true;
        reject(new Error('WebSocket closed before completion'));
      }
    };
  });
}