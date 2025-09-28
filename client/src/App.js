import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

// Simple config - reads from environment or uses default
const SERVER_PORT = process.env.CLIENT_PORT || 80;
const socketUrl =
  window.location.hostname === 'localhost'
    ? `http://localhost:${SERVER_PORT}`
    : `http://${window.location.hostname}:${SERVER_PORT}`;

const socket = io(socketUrl);

function App() {
  const [username, setUsername] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load message history
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Socket event listeners
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_joined', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: 'system',
        },
      ]);
    });

    socket.on('user_left', (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: 'system',
        },
      ]);
    });

    socket.on('user_typing', (data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    socket.on('user_stop_typing', (data) => {
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
      socket.emit('join', username.trim());
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit('send_message', {
        username,
        message: newMessage.trim(),
      });
      setNewMessage('');

      // Stop typing indicator
      socket.emit('stop_typing', { username });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // Emit typing event
    socket.emit('typing', { username });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { username });
    }, 1000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const fileInfo = await response.json();

      // Send file message via socket
      socket.emit('send_message', {
        username,
        message: `📎 Shared a file: ${fileInfo.originalname}`,
        message_type: 'file',
        file_name: fileInfo.originalname,
        file_path: fileInfo.filename,
        file_size: fileInfo.size,
        file_type: fileInfo.mimetype,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const isImageFile = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };

  if (!isJoined) {
    return (
      <div className='login-container'>
        <div className='login-card'>
          <h1>🏠 Local Chat</h1>
          <p>Join the local network chat</p>
          <form onSubmit={handleJoin}>
            <input
              type='text'
              placeholder='Enter your username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
            <button type='submit'>Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='chat-container'>
      <div className='chat-header'>
        <h1>🏠 Local Chat</h1>
        <div className='user-info'>
          <span className='username'>Welcome, {username}!</span>
        </div>
      </div>

      <div className='messages-container'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.type === 'system'
                ? 'system-message'
                : message.username === username
                ? 'own-message'
                : 'other-message'
            }`}
          >
            {message.type === 'system' ? (
              <div className='system-content'>
                <span className='system-text'>{message.message}</span>
                <span className='timestamp'>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            ) : (
              <>
                <div className='message-header'>
                  <span className='message-username'>{message.username}</span>
                  <span className='timestamp'>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className='message-content'>
                  {message.message_type === 'file' ? (
                    <div className='file-message'>
                      <div className='file-info'>
                        <div className='file-icon'>
                          {isImageFile(message.file_type) ? '🖼️' : '📎'}
                        </div>
                        <div className='file-details'>
                          <div className='file-name'>{message.file_name}</div>
                          <div className='file-size'>{formatFileSize(message.file_size)}</div>
                        </div>
                      </div>
                      {isImageFile(message.file_type) && (
                        <img 
                          src={`/api/files/${message.file_path}`}
                          alt={message.file_name}
                          className='file-image'
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className='file-actions'>
                        <a 
                          href={`/api/download/${message.file_path}`}
                          download={message.file_name}
                          className='file-download-btn'
                        >
                          ⬇️ Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    message.message
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {typingUsers.length > 0 && (
          <div className='typing-indicator'>
            <span>
              {typingUsers.length === 1
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.join(', ')} are typing...`}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div 
        className={`message-form-container ${dragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragActive && (
          <div className='drag-overlay'>
            <div className='drag-text'>📁 Drop file to share</div>
          </div>
        )}
        
        <form className='message-form' onSubmit={handleSendMessage}>
          <input
            type='text'
            placeholder='Type your message...'
            value={newMessage}
            onChange={handleTyping}
            maxLength={500}
            disabled={uploadingFile}
          />
          
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept='image/*,text/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx'
          />
          
          <button
            type='button'
            className='file-upload-btn'
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            title='Share file'
          >
            {uploadingFile ? '⏳' : '📎'}
          </button>
          
          <button 
            type='submit' 
            disabled={!newMessage.trim() || uploadingFile}
            className='send-btn'
          >
            {uploadingFile ? '⏳' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
