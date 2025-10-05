import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Message } from '../../types';
import ChatHeader from '../../components/ChatHeader';
import MessageList from '../../components/MessageList';
import MessageForm from '../../components/MessageForm';
import socketService from '../../services/socketService';
import messageService from '../../services/messageService';
import authService from '../../services/authService';
import './ChatPage.css';

interface ChatPageProps {
  user: User;
  onLogout: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onLogout }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Load messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await messageService.getMessages();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    socketService.connect(token);

    // Socket event handlers
    const handleAuthenticated = (...args: unknown[]) => {
      console.log('Socket authenticated:', args[0]);
    };

    const handleAuthError = (...args: unknown[]) => {
      console.error('Socket auth error:', args[0]);
      authService.clearAuth();
      onLogout();
    };

    const handleReceiveMessage = (...args: unknown[]) => {
      const message = args[0] as Message;
      setMessages((prev) => [...prev, message]);
    };

    const handleUserJoined = (...args: unknown[]) => {
      const data = args[0] as Partial<Message>;
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: 'system',
        } as Message,
      ]);
    };

    const handleUserLeft = (...args: unknown[]) => {
      const data = args[0] as Partial<Message>;
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: 'system',
        } as Message,
      ]);
    };

    const handleUserTyping = (...args: unknown[]) => {
      const data = args[0] as { username: string };
      setTypingUsers((prev) => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    };

    const handleUserStopTyping = (...args: unknown[]) => {
      const data = args[0] as { username: string };
      setTypingUsers((prev) => prev.filter((user) => user !== data.username));
    };

    // Register event handlers
    socketService.on('authenticated', handleAuthenticated);
    socketService.on('auth_error', handleAuthError);
    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('user_joined', handleUserJoined);
    socketService.on('user_left', handleUserLeft);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stop_typing', handleUserStopTyping);

    // Cleanup on unmount
    return () => {
      socketService.off('authenticated');
      socketService.off('auth_error');
      socketService.off('receive_message');
      socketService.off('user_joined');
      socketService.off('user_left');
      socketService.off('user_typing');
      socketService.off('user_stop_typing');
      socketService.disconnect();
    };
  }, [onLogout]);

  const handleSendMessage = useCallback(
    (message: string) => {
      socketService.sendMessage({ message });

      // Stop typing indicator
      socketService.stopTyping(user.username);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    [user.username]
  );

  const handleTyping = useCallback(() => {
    // Emit typing event
    socketService.typing(user.username);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(user.username);
    }, 1000);
  }, [user.username]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadingFile(true);

      try {
        const fileInfo = await messageService.uploadFile(file);

        // Send file message via socket
        socketService.sendMessage({
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
    },
    []
  );

  return (
    <div className="chat-container">
      <ChatHeader user={user} onLogout={onLogout} />
      <MessageList
        messages={messages}
        currentUsername={user.username}
        typingUsers={typingUsers}
      />
      <MessageForm
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onTyping={handleTyping}
        uploadingFile={uploadingFile}
      />
    </div>
  );
};

export default ChatPage;

