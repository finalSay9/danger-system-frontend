// components/Navbar.tsx
"use client";

import { useAuthStore } from "../lib/store";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <nav className="p-4 bg-green-500 text-white">
      <div className="container mx-auto flex justify-between">
        <Link href="/chats">Chats</Link>
        <div>
          <span className="mr-4">Welcome, {user.username}</span>
          <button onClick={logout} className="px-2 py-1 bg-red-500 rounded">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}