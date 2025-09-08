// app/chats/[chatId]/page.tsx
'use client'



import MessageList from "../../components/MessageList";
import MessageInput from "../../components/MessageInput";
import { useAuthStore } from "../../lib/store";
import { redirect } from "next/navigation";

interface ChatPageProps {
  params: { chatId: string };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { user } = useAuthStore();
  const chatId = parseInt(params.chatId);

  if (!user) {
    redirect("/auth/login");
  }

  // Assume receiverId is derived from chat participants (simplified)
  const receiverId = 2; // Replace with logic to get from chat participants

  return (
    <div className="min-h-screen flex flex-col">
      <MessageList chatId={chatId} />
      <MessageInput chatId={chatId} receiverId={receiverId} />
    </div>
  );
}