'use client';

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessagePut'
import { UserList } from './UserList'
import { LogOut, MessageCircle } from 'lucide-react';
import { ChatState } from '../../types/Chat'


interface ChatWindowProps {
  chatState: ChatState;
  onSendMessage: (message: string) => void;
  onLogout: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatState,
  onSendMessage,
  onLogout,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.currentRoom?.messages]);

  if (!chatState.currentUser || !chatState.currentRoom) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-white">
      <UserList users={chatState.users} currentUserId={chatState.currentUser.id} />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {chatState.currentRoom.name}
              </h1>
              <p className="text-sm text-gray-500">
                {chatState.currentRoom.participants.length} participants
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Welcome, {chatState.currentUser.username}!
            </span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {chatState.currentRoom.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div>
              {chatState.currentRoom.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === chatState.currentUser?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={!chatState.isConnected}
        />
      </div>
    </div>
  );
};