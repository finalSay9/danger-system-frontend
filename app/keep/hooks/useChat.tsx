'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Message, ChatRoom, ChatState } from '../../types/Chat';

// API functions (you'll need to implement these based on your backend)
const apiClient = {
  // Fetch all users from database
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('/users/read_all_users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // Fetch chat rooms for current user
  getRooms: async (userId: string): Promise<ChatRoom[]> => {
    try {
      const response = await fetch(`/api/rooms?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },

  // Fetch messages for a specific room
  getMessages: async (roomId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  // Send message to database
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Login/authenticate user
  // Login/authenticate user
loginUser: async (username: string, password: string): Promise<any> => {
  try {
    const response = await fetch('http://localhost:8000/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username,
        password,
      }).toString(),
    });
    if (!response.ok) throw new Error('Failed to login');
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
},

  // Update user online status
  updateUserStatus: async (userId: string, isOnline: boolean): Promise<void> => {
    try {
      await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline }),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  },
};

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    currentUser: null,
    currentRoom: null,
    rooms: [],
    users: [],
    isConnected: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from database
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await apiClient.getUsers();
      setChatState(prev => ({ ...prev, users }));
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch rooms for current user
  const fetchRooms = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const rooms = await apiClient.getRooms(userId);
      
      // If user has rooms, set the first one as current room and fetch its messages
      if (rooms.length > 0) {
        const firstRoom = rooms[0];
        const messages = await apiClient.getMessages(firstRoom.id);
        const roomWithMessages = { ...firstRoom, messages };
        
        setChatState(prev => ({
          ...prev,
          rooms: rooms,
          currentRoom: roomWithMessages,
          isConnected: true,
        }));
      } else {
        // Create a default room if none exist
        setChatState(prev => ({
          ...prev,
          rooms: [],
          currentRoom: null,
          isConnected: true,
        }));
      }
    } catch (err) {
      setError('Failed to fetch chat rooms');
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data when user logs in
  useEffect(() => {
    if (chatState.currentUser) {
      fetchUsers();
      fetchRooms(chatState.currentUser.id);
    }
  }, [chatState.currentUser, fetchUsers, fetchRooms]);

  // Set up real-time updates (WebSocket, Server-Sent Events, or polling)
  useEffect(() => {
    if (!chatState.currentUser || !chatState.isConnected) return;

    // Example: WebSocket connection
    const ws = new WebSocket(`ws://localhost:3001/chat?userId=${chatState.currentUser.id}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          // Add new message to current room
          setChatState(prev => {
            if (!prev.currentRoom || prev.currentRoom.id !== data.message.roomId) {
              return prev;
            }
            
            const updatedRoom = {
              ...prev.currentRoom,
              messages: [...prev.currentRoom.messages, data.message],
              lastActivity: new Date(),
            };
            
            return {
              ...prev,
              currentRoom: updatedRoom,
              rooms: prev.rooms.map(room =>
                room.id === updatedRoom.id ? updatedRoom : room
              ),
            };
          });
          break;
          
        case 'user_status_change':
          // Update user online status
          setChatState(prev => ({
            ...prev,
            users: prev.users.map(user =>
              user.id === data.userId
                ? { ...user, isOnline: data.isOnline, lastSeen: data.lastSeen }
                : user
            ),
          }));
          break;
          
        case 'new_user':
          // Add new user to the list
          setChatState(prev => ({
            ...prev,
            users: [...prev.users, data.user],
          }));
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setChatState(prev => ({ ...prev, isConnected: false }));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    // Cleanup
    return () => {
      ws.close();
    };
  }, [chatState.currentUser, chatState.isConnected]);

  // Login function
  const login = useCallback(async (username: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await apiClient.loginUser(username,password);
      
      setChatState(prev => ({
        ...prev,
        currentUser: user,
      }));
      
      // Update user status to online
      await apiClient.updateUserStatus(user.id, true);
      
    } catch (err) {
      setError('Failed to login');
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!chatState.currentUser || !chatState.currentRoom || !content.trim()) {
      return;
    }

    try {
      const messageData = {
        content: content.trim(),
        senderId: chatState.currentUser.id,
        senderUsername: chatState.currentUser.username,
        roomId: chatState.currentRoom.id,
        type: 'text' as const,
      };

      // Send message to database
      const savedMessage = await apiClient.sendMessage(messageData);

      // Update local state (real-time updates will also handle this via WebSocket)
      setChatState(prev => {
        if (!prev.currentRoom) return prev;

        const updatedRoom = {
          ...prev.currentRoom,
          messages: [...prev.currentRoom.messages, savedMessage],
          lastActivity: new Date(),
        };

        return {
          ...prev,
          currentRoom: updatedRoom,
          rooms: prev.rooms.map(room =>
            room.id === updatedRoom.id ? updatedRoom : room
          ),
        };
      });

    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
    }
  }, [chatState.currentUser, chatState.currentRoom]);

  // Logout function
  const logout = useCallback(async () => {
    if (chatState.currentUser) {
      // Update user status to offline
      await apiClient.updateUserStatus(chatState.currentUser.id, false);
    }
    
    setChatState({
      currentUser: null,
      currentRoom: null,
      rooms: [],
      users: [],
      isConnected: false,
    });
    
    setError(null);
  }, [chatState.currentUser]);

  // Switch to different room
  const switchRoom = useCallback(async (roomId: string) => {
    try {
      setLoading(true);
      const room = chatState.rooms.find(r => r.id === roomId);
      if (!room) return;
      
      const messages = await apiClient.getMessages(roomId);
      const roomWithMessages = { ...room, messages };
      
      setChatState(prev => ({
        ...prev,
        currentRoom: roomWithMessages,
      }));
    } catch (err) {
      setError('Failed to switch room');
      console.error('Switch room error:', err);
    } finally {
      setLoading(false);
    }
  }, [chatState.rooms]);

  return {
    ...chatState,
    loading,
    error,
    login,
    logout,
    sendMessage,
    switchRoom,
    fetchUsers,
  };
};