import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LS_KEYS } from '../utils/storage';
import { loginApi, signupApi } from '../api/authApi';
import { fetchConversationList } from '../api/chatApi';
import { ConversationSummary } from '../types/chat';

export type AuthContextValue = {
  userId: string | null;
  guest: boolean;
  displayName?: string | null;
  login: (email: string, password: string) => Promise<string>;
  signup: (name: string, email: string, password: string) => Promise<string>;
  loginAsGuest: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useLocalStorage<string | null>(LS_KEYS.userId, null);
  const [guest, setGuest] = useLocalStorage<boolean>(LS_KEYS.guest, false);
  const [profile, setProfile] = useLocalStorage<{ name?: string } | null>(LS_KEYS.profile, null);
  const [, setSummaries] = useLocalStorage<ConversationSummary[]>(LS_KEYS.summaries, []);
  const [, setCurrentConversationId] = useLocalStorage<string | null>(LS_KEYS.currentId, null);
  const [, setToken] = useLocalStorage<string | null>(LS_KEYS.token, null);
  const login = useCallback(async (email: string, password: string) => {
    const { userId: id, name, token: returnedToken } = await loginApi({ email, password });
    setUserId(id);
    setProfile({ name });
    setGuest(false);
    setToken(returnedToken ?? null);
    try {
      const items = await fetchConversationList(id);
      setSummaries(items);
    } catch {
      setSummaries([]);
    }
    return id;
  }, [setUserId, setGuest, setProfile, setSummaries]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { userId: id, name: returnedName, token: returnedToken } = await signupApi({ name, email, password });
    setUserId(id);
    setProfile({ name: returnedName ?? name });
    setToken(returnedToken ?? null);
    setGuest(false);
    try {
      const items = await fetchConversationList(id);
      setSummaries(items);
    } catch {
      setSummaries([]);
    }
    return id;
  }, [setUserId, setGuest, setProfile, setSummaries]);

  const loginAsGuest = useCallback(() => {
    setUserId(null);
    setProfile(null);
    setGuest(true);
    setSummaries([]);
    setCurrentConversationId(null);
    setToken(null);
  }, [setUserId, setGuest, setProfile, setSummaries, setCurrentConversationId, setToken]);

  const logout = useCallback(() => {
    setUserId(null);
    setProfile(null);
    setGuest(false);
    setSummaries([]);
    setCurrentConversationId(null);
    setToken(null);
  }, [setUserId, setGuest, setProfile, setSummaries, setCurrentConversationId, setToken]);

  const value = useMemo<AuthContextValue>(() => ({ userId, guest, displayName: profile?.name ?? null, login, signup, loginAsGuest, logout }), [userId, guest, profile, login, signup, loginAsGuest, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
