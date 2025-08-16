import React, { useEffect, useRef, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Moon, Sun, User, Menu, X, Wrench } from "lucide-react";
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
import cn from "./utils/cn";
import { Button } from "./components/ui/Button";
import { IconButton } from "./components/ui/IconButton";
import { Loader } from "./components/ui/Loader";
import { AppLogo } from "./components/ui/AppLogo";

// using shared cn utility

export default function ChatApp() {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    async function refreshData() {
      if (currentConversationId) {
        setIsLoading(true);
        try {
          const history = await fetchConversationMessages(currentConversationId);
          if (!cancelled) setMessages(history);
        } catch (err) {
          console.warn("Could not load messages:", err);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      } else if (userId) {
        if (!cancelled) setIsLoadingConversations(true);
        try {
          const items = await fetchConversationList(userId);
          if (!cancelled) setConversationSummaries(items);
        } catch (err) {
          console.warn("Could not load conversation list:", err);
        } finally {
          if (!cancelled) setIsLoadingConversations(false);
        }
      }
    }
    refreshData();
    return () => {
      cancelled = true;
    };
  }, [currentConversationId, userId, setConversationSummaries]);

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
    // Close mobile sidebar after navigation
    setMobileSidebarOpen(false);
  }

  function handleNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
    setMobileSidebarOpen(false);
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

  const renderSidebar = (isCollapsed: boolean) => (
    <div className={cn(
      "h-full flex flex-col transition-all overflow-hidden",
      theme === "dark" ? "bg-[#17181c] border-r border-white/5" : "bg-gray-50 border-r border-black/10",
      isCollapsed ? "w-14" : "w-80"
    )}>
      {isCollapsed ? (
        <div className={cn("flex flex-col items-center p-2 gap-2 border-b", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <IconButton onClick={handleNewChat} label="New chat" className="w-10 h-10 flex items-center justify-center bg-[#10a37f] text-white hover:bg-[#0e8e6f]">
            <Plus size={16} />
          </IconButton>
          <IconButton onClick={() => setCollapsed(false)} label="Expand" className="hidden md:inline-flex">
            <ChevronRight size={18} />
          </IconButton>
        </div>
      ) : (
        <div className={cn("flex items-center justify-between p-3 gap-2 border-b", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <Button onClick={handleNewChat} size="md" variant="primary">
            <Plus size={16} /> New chat
          </Button>
          <div className="flex items-center gap-1">
            <IconButton onClick={() => setMobileSidebarOpen(false)} label="Close" className="md:hidden">
              <X size={18} />
            </IconButton>
            <IconButton onClick={() => setCollapsed(true)} label="Collapse" className="hidden md:inline-flex">
              <ChevronLeft size={18} />
            </IconButton>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500 dark:text-white/40">Conversations</div>
      )}
      <div className={cn("flex-1 overflow-auto p-2 space-y-1", isCollapsed && "hidden") }>
        {isLoadingConversations && !isCollapsed && (
          <div className="px-2 py-2">
            <Loader label="Loading conversations…" className={cn(theme === "dark" ? "text-white/60" : "text-gray-600")} />
          </div>
        )}
        {!isLoadingConversations && conversationSummaries.length === 0 && !isCollapsed && (
          <div className="text-xs text-center text-gray-500 dark:text-white/40 px-2 py-2">No conversations yet.</div>
        )}
        {!isCollapsed && conversationSummaries.map((c) => (
          <SidebarConversationItem
            key={c.id}
            active={c.id === currentConversationId}
            title={c.title}
            subtitle={c.last_message_preview ? `${c.last_message_preview} • ${timeAgo(c.created_at)}` : timeAgo(c.created_at)}
            onClick={() => handleSelectConversation(c.id)}
            onDelete={!isCollapsed ? () => handleDeleteSummary(c.id) : undefined}
          />
        ))}
      </div>

      {!isCollapsed && (
        <div className={cn("p-3 border-t text-sm flex items-center justify-between", theme === "dark" ? "border-white/5 text-white/60" : "border-black/10 text-gray-600") }>
          <div className="flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", theme === "dark" ? "bg-white/10 text-white/70" : "bg-black/5 text-gray-700") }>
              <User size={14} />
            </div>
            {userId ? (displayName ? displayName : `User: ${userId}`) : "Anonymous"}
          </div>
          {userId ? (
            <Button onClick={logout} size="sm" variant="neutral">Logout</Button>
          ) : (
            <Button onClick={logout} size="sm" variant="neutral">Login</Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={cn("h-screen w-screen flex", theme === "dark" ? "bg-[#212329] text-white" : "bg-white text-gray-900") }>
      <div className="hidden md:block">{renderSidebar(collapsed)}</div>
      <div className="flex-1 flex flex-col">
        <div className={cn("h-12 border-b flex items-center px-4 gap-3", theme === "dark" ? "border-white/5" : "border-black/10") }>
          <IconButton onClick={() => setMobileSidebarOpen(true)} label="Open menu" className="md:hidden">
            <Menu size={18} />
          </IconButton>
          <AppLogo size={24} />
          <div className="font-medium">Eloquent Operator</div>
          <div className="flex-1" />
          {/* Conversation list loading indicator */}
          {isLoadingConversations && (
            <Loader className={cn(theme === 'dark' ? 'text-white/70' : 'text-gray-600')} size={14} label="Syncing" />
          )}
          <IconButton onClick={() => alert('Tools coming soon')} label="Tools">
            <Wrench size={16} />
          </IconButton>
          <IconButton onClick={toggle} label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-semibold mb-2">How can I help today?</div>
                <div className={cn(theme === "dark" ? "text-white/60" : "text-gray-600")}>Ask anything. Your first message will start a new conversation.</div>
              </div>
            </div>
          ) : (
            <div className="">
              {messages.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {isLoading && (
                <Loader label="Generating..." className={cn("max-w-3xl mx-auto px-4 py-5", theme === "dark" ? "text-white/60" : "text-gray-600")} />
              )}
            </div>
          )}
        </div>

        <Composer disabled={isLoading} onSend={handleSend} />
      </div>
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-40 md:hidden", mobileSidebarOpen ? "block" : "hidden") }>
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
        <div className="absolute inset-y-0 left-0">
          {renderSidebar(false)}
        </div>
      </div>
    </div>
  );
}