// app/chats/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MessageList from "../../components/MessageList";
import { useAuthStore } from "../../lib/store";
import { sendMessage } from "../../lib/api";
import { socketClient } from "../../lib/socket";

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !token) {
      router.push?.("/auth/login");
    } else {
      const socket = socketClient.connect(token.access_token, parseInt(params.id));
      socket.on("message", () => {
        // Trigger refetch or update UI
      });
      return () => socketClient.disconnect();
    }
  }, [user, token, params.id, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      await sendMessage({
        chat_id: parseInt(params.id),
        content: message,
        sender_id: user.id,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <MessageList chatId={parseInt(params.id)} />
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}