import React from 'react';
import type { Message } from '../../types';
import messageService from '../../services/messageService';
import './MessageItem.css';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage }) => {
  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (fileType?: string) => {
    return fileType && fileType.startsWith('image/');
  };

  const linkifyText = (text: string) => {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    const parts = text.split(urlPattern);
    
    return parts.map((part, index) => {
      if (part.match(urlPattern)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (message.type === 'system') {
    return (
      <div className="message system-message">
        <div className="system-content">
          <span className="system-text">{message.message}</span>
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`message ${
        isOwnMessage ? 'own-message' : 'other-message'
      }`}
    >
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        <span className="timestamp">{formatTime(message.timestamp)}</span>
      </div>
      <div className="message-content">
        {message.message_type === 'file' ? (
          <div className="file-message">
            <div className="file-info">
              <div className="file-icon">
                {isImageFile(message.file_type) ? '🖼️' : '📎'}
              </div>
              <div className="file-details">
                <div className="file-name">{message.file_name}</div>
                <div className="file-size">
                  {formatFileSize(message.file_size || 0)}
                </div>
              </div>
            </div>
            {isImageFile(message.file_type) && message.file_path && (
              <img
                src={messageService.getFileUrl(message.file_path)}
                alt={message.file_name}
                className="file-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            {message.file_path && (
              <div className="file-actions">
                <a
                  href={messageService.getDownloadUrl(message.file_path)}
                  download={message.file_name}
                  className="file-download-btn"
                >
                  ⬇️ Download
                </a>
              </div>
            )}
          </div>
        ) : (
          <span>{linkifyText(message.message)}</span>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

