// lib/types.ts
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
}

export enum ChatType {
  DIRECT = "direct",
  GROUP = "group",
}

export interface User {
  id: number;
  username: string;
  email: string;
  gender?: Gender;
  first_name?: string;
  last_name?: string;
  created_at: string;
  is_active: boolean;
  
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface Message {
  id: number;
  sender: User;
  receiver_id: number;
  content: string;
  message_type: MessageType;
  attachment_url?: string;
  parent_message_id?: number;
  timestamp: string;
  is_read: boolean;
}

export interface Chat {
  id: number;
  name: string;
  chat_type: ChatType;
  participants: User[];
  created_at: string;
  last_message?: Message;
}

export interface PaginatedMessages {
  messages: Message[];
  total: number;
  page: number;
  page_size: number;
}

export interface MessageCreate {
  sender_id: number;
  receiver_id: number;
  chat_id: number;
  content: string;
  message_type?: MessageType;
  attachment_url?: string;
  parent_message_id?: number;
  timestamp?: string;
  is_read?: boolean;
}

export interface ChatCreate {
  name: string;
  chat_type?: ChatType;
  participant_ids: number[];
}