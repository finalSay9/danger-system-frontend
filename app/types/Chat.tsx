export interface User {
  id: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  edited?: boolean;
  replyTo?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: User[];
  messages: Message[];
  lastActivity: Date;
}

export interface ChatState {
  currentUser: User | null;
  currentRoom: ChatRoom | null;
  rooms: ChatRoom[];
  users: User[];
  isConnected: boolean;
}