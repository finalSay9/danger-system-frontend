// lib/store.ts
import { create } from "zustand";
import { User, Token, Chat, Message } from "./types";

interface AuthState {
  user: User | null;
  token: Token | null;
  setUser: (user: User | null) => void;
  setToken: (token: Token | null) => void;
  logout: () => void;
}

interface ChatState {
  chats: Chat[];
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  setChats: (chats: Chat[]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("access_token", token.access_token);
      if (token.refresh_token) {
        localStorage.setItem("refresh_token", token.refresh_token);
      }
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
}));

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  updateChat: (updatedChat) =>
    set((state) => ({
      chats: state.chats.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)),
    })),
  setChats: (chats) => set({ chats }),
}));