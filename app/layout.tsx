// app/layout.tsx
import "./globals.css";
import { Metadata } from "next";
import Navbar from './components/NavBar'
import QueryProvider from "./components/QueryProvider";

export const metadata: Metadata = {
  title: "ChatApp",
  description: "A real-time chat application built with Next.js and FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}