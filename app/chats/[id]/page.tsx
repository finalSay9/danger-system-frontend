// app/chats/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import MessageList from "../../components/MessageList";
import { useAuthStore } from "../../lib/store";
import { sendMessage } from "../../lib/api";
import { socketClient } from "../../lib/socket";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // unwrap params (Next.js 15+)
  const { id } = use(params);
  const chatId = Number(id);

  useEffect(() => {
    console.log("ChatPage params:", { id }, "chatId:", chatId);

    if (!user || !token) {
      router.push?.("/auth/login");
      return;
    }

    if (isNaN(chatId)) {
      console.error("Invalid chatId:", id);
      router.push("/chats");
      return;
    }

    try {
      socketClient.connect(token.access_token, chatId, {
        onMessage: (data) => {
          console.log("📩 Received WebSocket message:", data);
          // You could add setState here to update messages
        },
        onOpen: () => console.log("🔌 Connected to chat", chatId),
        onClose: () => console.log("🔌 Disconnected from chat", chatId),
      });

      return () => socketClient.disconnect();
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    } finally {
      setLoading(false);
    }
  }, [user, token, chatId, id, router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !user || isNaN(chatId)) {
      console.error("Cannot send message: invalid input or chatId");
      return;
    }

    try {
      // TODO: Replace receiverId with actual participant logic
      const receiverId = 1;

      await sendMessage({
        chat_id: chatId,
        content: message,
        sender_id: user.id,
        receiver_id: receiverId,
      });

      // also push to WebSocket (optional, to broadcast instantly)
      socketClient.sendMessage({
        chat_id: chatId,
        content: message,
        sender_id: user.id,
        receiver_id: receiverId,
      });

      console.log("Message sent successfully:", message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) return <div>Loading chat...</div>;

  if (!user || isNaN(chatId)) {
    console.error("ChatPage not rendering: user or chatId invalid", { user, chatId });
    return <div>Invalid chat. Redirecting...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <MessageList chatId={chatId} />
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
