'use client';
import{ User } from '../../types/Chat'
import { Circle } from 'lucide-react';

interface UserListProps {
  users: User[];
  currentUserId?: string;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Online Users ({users.filter(u => u.isOnline).length})</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex items-center p-3 hover:bg-gray-100 transition-colors ${
              user.id === currentUserId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <Circle
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 border-white rounded-full ${
                  user.isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                }`}
              />
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                  {user.id === currentUserId && <span className="text-gray-500 ml-1">(You)</span>}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {user.isOnline ? 'Online' : user.lastSeen ? formatLastSeen(user.lastSeen) : 'Offline'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};