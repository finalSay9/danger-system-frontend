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
  const [isTyping, setIsTyping] = useState(false);

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

    setIsTyping(true);
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
    } finally {
      setIsTyping(false);
    }
  };

  const handleEmojiClick = () => {
    // Placeholder for emoji picker
    console.log("Emoji picker clicked");
  };

  const handleAttachClick = () => {
    // Placeholder for file attachment
    console.log("Attach clicked");
  };

  const handleVoiceClick = () => {
    // Placeholder for voice message
    console.log("Voice message clicked");
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0b141a] flex items-center justify-center">
        <div className="text-[#8696a0]">Loading chat...</div>
      </div>
    );
  }

  if (!user || isNaN(chatId)) {
    console.error("ChatPage not rendering: user or chatId invalid", { user, chatId });
    return (
      <div className="h-screen bg-[#0b141a] flex items-center justify-center">
        <div className="text-[#8696a0]">Invalid chat. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0b141a] flex flex-col">
      {/* Chat Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-[#313d45]">
        <button
          onClick={() => router.push("/chats")}
          className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1] mr-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium">
          C
        </div>

        <div className="flex-1">
          <h2 className="text-white font-medium">Chat {chatId}</h2>
          <p className="text-xs text-[#8696a0]">
            {isTyping ? "typing..." : "click here for contact info"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <MessageList chatId={chatId} />

      {/* Message Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-t border-[#313d45]"
      >
        <button
          type="button"
          onClick={handleEmojiClick}
          className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]"
        >
          <span role="img" aria-label="emoji">😊</span>
        </button>
        <button
          type="button"
          onClick={handleAttachClick}
          className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]"
        >
          <span role="img" aria-label="attach">📎</span>
        </button>
        <input
          type="text"
          className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-white outline-none"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isTyping}
        />
        <button
          type="button"
          onClick={handleVoiceClick}
          className="p-2 rounded-full hover:bg-[#2a3942] transition-colors text-[#aebac1]"
        >
          <span role="img" aria-label="voice">🎤</span>
        </button>
        <button
          type="submit"
          className="p-2 rounded-full bg-[#00a884] text-white hover:bg-[#019875] transition-colors"
          disabled={isTyping || !message.trim()}
        >
          <span role="img" aria-label="send">➡️</span>
        </button>
      </form>
    </div>
  );
}