// lib/socket.ts
import { io, Socket } from "socket.io-client";
import { Message, MessageCreate } from "./types";

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string, chatId: number): Socket {
    this.socket = io("http://localhost:8000", {
      auth: { token },
      query: { chatId: chatId.toString() },
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on("message", callback);
    }
  }

  sendMessage(message: MessageCreate) {
    if (this.socket) {
      this.socket.emit("message", message);
    }
  }
}

export const socketClient = new SocketClient();