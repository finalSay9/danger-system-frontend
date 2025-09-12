// components/ChatList.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { getChats } from "../lib/api";
import { useAuthStore } from "../lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChatList() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const { data: chats, isLoading, error } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: getChats,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  console.log("ChatList data:", { chats, isLoading, error });

  if (isLoading) {
    return (
      <div className="p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-12 h-12 bg-[#3b4a54] rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-[#3b4a54] rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-[#3b4a54] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-[#8696a0]">
        Error loading chats: {(error as Error).message}
      </div>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="p-8 text-center text-[#8696a0]">
        <div className="mb-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="mx-auto opacity-50">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V9h2v2zm0-4h-2V5h2v2z"/>
          </svg>
        </div>
        <p className="text-sm">No conversations yet.</p>
        <p className="text-xs mt-1">Start a new chat to begin messaging.</p>
      </div>
    );
  }

  return (
    <div>
      {chats.map((chat) => (
        <Link key={chat.id} href={`/chats/${chat.id}`}>
          <div className="flex items-center gap-3 p-3 hover:bg-[#2a3942] transition-colors border-b border-[#313d45] cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
              {chat.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-white truncate">{chat.name}</h3>
                <span className="text-xs text-[#8696a0]">
                  {chat.last_message?.timestamp ? 
                    new Date(chat.last_message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : 
                    ''
                  }
                </span>
              </div>
              <p className="text-sm text-[#8696a0] truncate">
                {chat.last_message?.content || "No messages yet"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
