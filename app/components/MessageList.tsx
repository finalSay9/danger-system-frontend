'use client'

import { useEffect, useRef } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId),
    enabled: !!user,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token && user) {
      socketClient.connect(token.access_token, chatId, {
        onMessage: (data: Message) => {
          console.log("📩 New message from WebSocket:", data);
          refetch();
        },
        onOpen: () => console.log("✅ WebSocket connected in MessageList"),
        onClose: () => console.log("❌ WebSocket closed in MessageList"),
      });
      return () => socketClient.disconnect();
    }
  }, [token, user, chatId, refetch]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages?.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = messages ? groupMessagesByDate(messages) : {};

  return (
    <div 
      className="flex-1 overflow-y-auto p-4"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%230d1418' fill-opacity='0.05'%3e%3cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        backgroundColor: '#0b141a'
      }}
    >
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex justify-center my-4">
            <span className="bg-[#182229] text-[#8696a0] px-3 py-1 rounded-lg text-xs">
              {formatDate(dateMessages[0].timestamp)}
            </span>
          </div>
          
          {/* Messages for this date */}
          {dateMessages.map((message, index) => {
            const isOwn = message.sender.id === user?.id;
            const showAvatar = !isOwn && (
              index === dateMessages.length - 1 || 
              dateMessages[index + 1]?.sender.id !== message.sender.id
            );
            
            return (
              <div
                key={message.id}
                className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar for other users */}
                {!isOwn && (
                  <div className="w-8 h-8 mr-2 flex items-end">
                    {showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white text-xs font-medium">
                        {message.sender.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Message bubble */}
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg relative ${
                    isOwn 
                      ? 'bg-[#005c4b] text-white' 
                      : 'bg-[#202c33] text-white'
                  }`}
                  style={{
                    borderRadius: isOwn 
                      ? '18px 18px 4px 18px' 
                      : '18px 18px 18px 4px'
                  }}
                >
                  {/* Sender name for group chats */}
                  {!isOwn && (
                    <p className="text-xs font-medium text-[#8696a0] mb-1">
                      {message.sender.username}
                    </p>
                  )}
                  
                  {/* Message content */}
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  
                  {/* Time and status */}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-[#8696a0]">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwn && (
                      <svg width="12" height="12" viewBox="0 0 16 15" className="text-[#8696a0]">
                        <path fill="currentColor" d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.85 4.85 5.437 8.22a.307.307 0 0 1-.425.023.31.31 0 0 1-.023-.425L8.425 4.4 9.48 3.316a.365.365 0 0 0-.063-.51l-.478-.372a.365.365 0 0 0-.51.063L6.47 4.45 2.707 8.22a.307.307 0 0 1-.425.023.31.31 0 0 1-.023-.425L4.532 5.464 5.587 4.38a.365.365 0 0 0-.063-.51l-.478-.372a.365.365 0 0 0-.51.063L2.3 5.99.685 7.607a.307.307 0 0 0 .013.433L4.345 11.4c.1.1.26.1.36 0l.97-.97 4.15-4.15.97-.97c.1-.1.1-.26 0-.36l-3.645-3.645z"/>
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}