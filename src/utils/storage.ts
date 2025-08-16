export const LS_KEYS = {
  currentId: "chat.currentConversationId",
  summaries: "chat.conversationSummaries",
  userId: "chat.userId",
  guest: "chat.guestMode",
  profile: "chat.userProfile",
} as const;

export function getFromLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function setInLocalStorage<T>(key: string, value: T): void {
  try {
    const next = JSON.stringify(value);
    const prev = localStorage.getItem(key);
    if (prev !== next) {
      localStorage.setItem(key, next);
      try {
        const event = new CustomEvent('local-storage', { detail: { key } });
        window.dispatchEvent(event);
      } catch {}
    }
  } catch {}
}
