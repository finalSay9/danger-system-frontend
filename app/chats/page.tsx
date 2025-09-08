// app/chats/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../lib/store";
import ChatList from "../components/ChatList";


export default function ChatsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user && router.push) {
      router.push("/auth/login");
    }
  }, [user, router]);

  if (!user) {
    return null; // Prevent rendering until redirect
  }

  return (
    <div className="min-h-screen">
      <ChatList />
    </div>
  );
}