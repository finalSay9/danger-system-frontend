// lib/socket.ts
export class SocketClient {
  private socket: WebSocket | null = null;

  connect(
    token: string,
    chatId: number,
    {
      onMessage,
      onOpen,
      onClose,
      onError,
    }: {
      onMessage?: (data: any) => void;
      onOpen?: () => void;
      onClose?: () => void;
      onError?: (err: Event) => void;
    } = {}
  ): WebSocket {
    if (!Number.isInteger(chatId)) {
      throw new Error(`Invalid chatId: ${chatId}`);
    }

    const url = `ws://localhost:8000/websocket/ws?chat_id=${chatId}&token=${token}`;
    console.log("Connecting WebSocket:", url);

    this.socket = new WebSocket(url);

    // ✅ open
    this.socket.addEventListener("open", () => {
      console.log("✅ WebSocket connected");
      onOpen?.();
    });

    // ✅ message
    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message:", data);
        onMessage?.(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e, event.data);
      }
    });

    // ✅ close
    this.socket.addEventListener("close", () => {
      console.log("❌ WebSocket closed");
      onClose?.();
    });

    // ✅ error
    this.socket.addEventListener("error", (err) => {
      console.error("⚠️ WebSocket error:", err);
      onError?.(err);
    });

    return this.socket;
  }

  sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Cannot send:", message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const socketClient = new SocketClient();
