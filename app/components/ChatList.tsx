// components/ChatList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getChats } from "../lib/api";
import { useAuthStore } from "../lib/store";
import Link from "next/link";

export default function ChatList() {
  const { user } = useAuthStore();
  const { data: chats, isLoading, error } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: getChats,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading chats: {(error as Error).message}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">Chats</h2>
      {chats?.map((chat) => (
        <Link key={chat.id} href={`/chats/${chat.id}`}>
          <div className="p-2 border-b">
            <h3>{chat.name}</h3>
            <p>{chat.last_message?.content || "No messages yet"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}