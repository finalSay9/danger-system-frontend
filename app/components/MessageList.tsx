// components/MessageList.tsx
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMessages } from "../lib/api";
import { socketClient } from "../lib/socket";
import { useAuthStore } from "../lib/store";
import { Message } from "../lib/types";

interface MessageListProps {
  chatId: number;
}

export default function MessageList({ chatId }: MessageListProps) {
  const { user, token } = useAuthStore();
  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId),
    enabled: !!user,
  });

  useEffect(() => {
    if (token && user) {
      socketClient.connect(token.access_token, chatId, {
        onMessage: (data: Message) => {
          console.log("📩 New message from WebSocket:", data);
          refetch(); // refresh message list when new message arrives
        },
        onOpen: () => console.log("✅ WebSocket connected in MessageList"),
        onClose: () => console.log("❌ WebSocket closed in MessageList"),
      });

      return () => socketClient.disconnect();
    }
  }, [token, user, chatId, refetch]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages?.messages.map((message) => (
        <div
          key={message.id}
          className={`p-2 mb-2 ${
            message.sender.id === user?.id ? "text-right" : "text-left"
          }`}
        >
          <p className="font-bold">{message.sender.username}</p>
          <p>{message.content}</p>
          <p className="text-sm text-gray-500">
            {new Date(message.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
