// components/MessageInput.tsx
import { useState } from "react";
import { sendMessage } from "../lib/api";
import { socketClient } from "../lib/socket";
import { useAuthStore } from "../lib/store";
import { MessageCreate } from "../lib/types";

interface MessageInputProps {
  chatId: number;
  receiverId: number;
}

export default function MessageInput({ chatId, receiverId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const { user } = useAuthStore();

  const handleSend = async () => {
    if (!content.trim() || !user) return;
    const message: MessageCreate = {
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      message_type: "text",
    };
    try {
      await sendMessage(message);
      socketClient.sendMessage({ ...message, chat_id: chatId });
      setContent("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="p-4 border-t">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message"
        className="w-full p-2 border"
      />
      <button onClick={handleSend} className="mt-2 p-2 bg-blue-500 text-white">
        Send
      </button>
    </div>
  );
}