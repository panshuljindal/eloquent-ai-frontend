import { BackendMessage, ConversationSummary, Message, Role } from '../types/chat';
import { CHAT_API_BASE as API_BASE } from 'config/env';

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
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_BASE}/messages/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch conversation messages');
  const json = await res.json();
  const raw = (json?.data?.messages ?? json?.messages ?? []) as BackendMessage[];
  return raw.map(mapBackendMessage).filter((m): m is Message => Boolean(m));
}

export async function postChatOnce(payload: { conversation_id: string | null; message: string; user_id?: string | null }): Promise<{ conversationId: string; messages: Message[] }> {
  const res = await fetch(`${API_BASE}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch(`${API_BASE}/delete/${conversationId}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function summarizeConversation(conversationId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/summarize/${conversationId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to summarize conversation');
  const json = await res.json();
  const summary = (json?.data?.summary ?? json?.summary ?? '') as string;
  return String(summary);
}