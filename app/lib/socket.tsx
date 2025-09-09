// lib/socket.ts
import { io, Socket } from "socket.io-client";

export class SocketClient {
  private socket: Socket | null = null;

  connect(token: string, chatId: number): Socket {
    if (!Number.isInteger(chatId)) {
      throw new Error(`Invalid chatId: ${chatId}`);
    }
    this.socket = io("http://localhost:8000", {
      path: "/websocket/ws", // Match backend WebSocket path
      query: { chat_id: chatId.toString() }, // Use chat_id to match backend
      auth: { token },
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();