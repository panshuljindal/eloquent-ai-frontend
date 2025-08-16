import { ConversationSummary, Message } from '../types/chat';
import { clamp } from './string';

export function buildConversationSummary(messages: Message[], conversationId: string): ConversationSummary {
  const firstUser = messages.find((m) => m.role === 'user');
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant') ?? messages[messages.length - 1];
  return {
    id: String(conversationId),
    title: clamp(firstUser?.content || 'New chat', 60),
    last_message_preview: lastAssistant ? clamp(lastAssistant.content, 80) : undefined,
    created_at: messages[0]?.createdAt || new Date().toISOString(),
  };
}


