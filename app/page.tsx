// app/page.tsx
'use client'


import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./lib/store";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to /chats
  useEffect(() => {
    if (user) {
      router.push("/chats");
    }
  }, [user, router]);

  // Display landing page for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl text-black font-bold mb-4">Welcome to ChatApp</h1>
      <p className="text-lg text-blue-600 mb-8">Connect with friends and start chatting instantly!</p>
      <div className="space-x-4">
        <Link href="/auth/login">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Login
          </button>
        </Link>
        <Link href="/auth/register">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}