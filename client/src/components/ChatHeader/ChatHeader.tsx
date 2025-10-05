import React from 'react';
import type { User } from '../../types';
import './ChatHeader.css';

interface ChatHeaderProps {
  user: User;
  onLogout: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onLogout }) => {
  return (
    <div className="chat-header">
      <h1>🏠 Local Chat</h1>
      <div className="user-info">
        <span className="username">Welcome, {user.username}!</span>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

