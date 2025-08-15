import React, { useEffect, useRef, useState } from "react";
import { Plus, Loader2, LogIn, LogOut, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { LS_KEYS } from "./utils/storage";
import { timeAgo } from "./utils/time";
import { ConversationSummary, Message } from "./types/chat";
import { deleteConversation, fetchConversationList, fetchConversationMessages, postChatOnce } from "./api/chatApi";
import { SidebarConversationItem } from "./components/SidebarConversationItem";
import { ChatBubble } from "./components/ChatBubble";
import { Composer } from "./components/Composer";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ChatApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streaming] = useState(false); // streaming disabled for this backend
  const { theme, toggle } = useTheme();

  const [currentConversationId, setCurrentConversationId] = useLocalStorage<string | null>(LS_KEYS.currentId, null);
  const [conversationSummaries, setConversationSummaries] = useLocalStorage<ConversationSummary[]>(LS_KEYS.summaries, []);
  const { userId, displayName, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, streaming]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (currentConversationId === null) {
        if (userId === null) {
          return;
        }
        try { 
          const items = await fetchConversationList(userId);
          if (!cancelled) setConversationSummaries(items);
        } catch (err) {
          console.warn("Could not load conversation list:", err);
        }
      } else {
        try {
          const history = await fetchConversationMessages(currentConversationId);
          if (!cancelled) setMessages(history);
        } catch (err) {
          console.warn("Could not load messages:", err);
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function maybeFetch() {
      if (currentConversationId === null && userId !== null) {
        try {
          const items = await fetchConversationList(userId);
          if (!cancelled) setConversationSummaries(items);
        } catch (err) {
          console.warn("Could not load conversation list:", err);
        }
      }
    }
    maybeFetch();
    return () => {
      cancelled = true;
    };
  }, [userId, currentConversationId, setConversationSummaries]);

  async function handleSelectConversation(id: string) {
    setCurrentConversationId(id);
    setIsLoading(true);
    try {
      const history = await fetchConversationMessages(id);
      setMessages(history);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
  }

  async function handleSend(text: string) {
    const userMsg: Message = {
      id: `local-${crypto.randomUUID()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    const payload = { conversation_id: currentConversationId, message: text, user_id: userId } as { conversation_id: string | null; message: string; user_id?: string | null };

    setIsLoading(true);
    try {
      const { conversationId, messages: fullMessages } = await postChatOnce(payload);
      if (!currentConversationId && conversationId) setCurrentConversationId(conversationId);
      setMessages(fullMessages);

      const summarize = (msgs: Message[]): ConversationSummary => {
        const firstUser = msgs.find((m) => m.role === "user");
        const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant") ?? msgs[msgs.length - 1];
        const clamp = (s: string, n: number) => (s.replace(/\s+/g, " ").trim().slice(0, n) + (s.length > n ? "…" : ""));
        return {
          id: String(conversationId),
          title: clamp(firstUser?.content || "New chat", 60),
          last_message_preview: lastAssistant ? clamp(lastAssistant.content, 80) : undefined,
          created_at: msgs[0]?.createdAt || new Date().toISOString(),
        };
      };
      if (conversationId) {
        const next = summarize(fullMessages);
        setConversationSummaries((prev) => {
          const rest = prev.filter((c) => c.id !== next.id);
          return [next, ...rest];
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${crypto.randomUUID()}`, role: "assistant", content: "Sorry, something went wrong while getting the response." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSummary(id: string) {
    setConversationSummaries((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      handleNewChat();
    }
    try {
        await deleteConversation(id);
    } catch (err) {
      console.error(err);
    }
  }

  const sidebar = (
    <div className={cn(
      "h-full flex flex-col transition-all overflow-hidden",
      theme === "dark" ? "bg-[#17181c] border-r border-white/5" : "bg-gray-50 border-r border-black/10",
      collapsed ? "w-14" : "w-80"
    )}>
      {collapsed ? (
        <div className={cn("flex flex-col items-center p-2 gap-2 border-b", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#10a37f] text-white hover:bg-[#0e8e6f]"
            title="New chat"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
            title="Expand"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className={cn("flex items-center justify-between p-3 gap-2 border-b", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-[#10a37f] text-white hover:bg-[#0e8e6f]"
            title="New chat"
          >
            <Plus size={16} /> New chat
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
            title="Collapse"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500 dark:text-white/40">Conversations</div>
      )}
      <div className={cn("flex-1 overflow-auto p-2 space-y-1", collapsed && "hidden") }>
        {conversationSummaries.length === 0 && !collapsed && (
          <div className="text-xs text-gray-500 dark:text-white/40 px-2">No conversations yet.</div>
        )}
        {!collapsed && conversationSummaries.map((c) => (
          <SidebarConversationItem
            key={c.id}
            active={c.id === currentConversationId}
            title={c.title}
            subtitle={c.last_message_preview ? `${c.last_message_preview} • ${timeAgo(c.created_at)}` : timeAgo(c.created_at)}
            onClick={() => handleSelectConversation(c.id)}
            onDelete={!collapsed ? () => handleDeleteSummary(c.id) : undefined}
          />
        ))}
      </div>

      {!collapsed && (
        <div className={cn("p-3 border-t text-sm flex items-center justify-between", theme === "dark" ? "border-white/5 text-white/60" : "border-black/10 text-gray-600") }>
          <div className="flex items-center gap-2"><LogIn size={16} /> {userId ? (displayName ? displayName : `User: ${userId}`) : "Anonymous"}</div>
          <button onClick={logout} className="px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" title="Logout"><LogOut size={16} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("h-screen w-screen flex", theme === "dark" ? "bg-[#212329] text-white" : "bg-white text-gray-900") }>
      {sidebar}
      <div className="flex-1 flex flex-col">
        <div className={cn("h-12 border-b flex items-center px-4 gap-3", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <div className="h-6 w-6 rounded bg-[#10a37f]" />
          <div className="font-medium">Eloquent Operator</div>
          <div className="flex-1" />
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {currentConversationId && (
            <div className="text-xs text-gray-600 dark:text-white/50">Conversation: {currentConversationId}</div>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-semibold mb-2">How can I help today?</div>
                <div className="text-white/60">Ask anything. Your first message will start a new conversation.</div>
              </div>
            </div>
          ) : (
            <div className="">
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {isLoading && (
                <div className={cn(
                  "max-w-3xl mx-auto px-4 py-5 flex items-center gap-2",
                  theme === "dark" ? "text-white/60" : "text-gray-600"
                )}>
                  <Loader2 className="animate-spin" size={16} /> Generating...
                </div>
              )}
            </div>
          )}
        </div>

        <Composer disabled={isLoading} onSend={handleSend} />
      </div>
    </div>
  );
}