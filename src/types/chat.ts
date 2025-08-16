export type Role = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
};

export type ConversationSummary = {
  id: string;
  title: string;
  last_message_preview?: string;
  created_at?: string;
};

export type BackendMessage = {
  id?: string | number;
  role?: Role;
  content?: string;
  created_at?: string;
  conversation_id?: string | number;
};
