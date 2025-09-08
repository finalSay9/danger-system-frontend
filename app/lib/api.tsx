// lib/api.ts
import axios, { AxiosInstance } from "axios";
import { Token, User, Chat, Message, PaginatedMessages, MessageCreate, ChatCreate } from "./types";

export const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  gender?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}): Promise<User> => {
  const response = await api.post<User>("/users/register", data);
  return response.data;
};

export const login = async (data: { email: string; password: string }): Promise<Token> => {
  const response = await api.post<Token>(
    "/auth/token",
    new URLSearchParams({
      username: data.email,
      password: data.password,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/users/me");
  return response.data;
};

export const sendMessage = async (message: MessageCreate): Promise<Message> => {
  const response = await api.post<Message>("/messages/", message);
  return response.data;
};

export const getMessages = async (chatId: number, page: number = 1, pageSize: number = 20): Promise<PaginatedMessages> => {
  const response = await api.get<PaginatedMessages>(`/chats/${chatId}/messages`, {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const createChat = async (chat: ChatCreate): Promise<Chat> => {
  const response = await api.post<Chat>("/chats/", chat);
  return response.data;
};

export const getChats = async (): Promise<Chat[]> => {
  const response = await api.get<Chat[]>("/chats/");
  return response.data;
};

export const refreshToken = async (refreshToken: string): Promise<Token> => {
  const response = await api.post<Token>("/auth/refresh", { refresh_token: refreshToken });
  return response.data;
};