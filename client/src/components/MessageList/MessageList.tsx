import React, { useRef, useEffect } from 'react';
import type { Message } from '../../types';
import MessageItem from '../MessageItem';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUsername,
  typingUsers,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <MessageItem
          key={index}
          message={message}
          isOwnMessage={message.username === currentUsername}
        />
      ))}

      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`}
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

