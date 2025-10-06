import React, { useState, useRef } from 'react';
import './MessageForm.css';

interface MessageFormProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  onTyping: () => void;
  uploadingFile: boolean;
}

const MessageForm: React.FC<MessageFormProps> = ({
  onSendMessage,
  onFileUpload,
  onTyping,
  uploadingFile,
}) => {
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div
      className={`message-form-container ${dragActive ? 'drag-active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragActive && (
        <div className="drag-overlay">
          <div className="drag-text">📁 Drop file to share</div>
        </div>
      )}

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={handleTyping}
          maxLength={500}
          disabled={uploadingFile}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,video/*,audio/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/*"
        />

        <button
          type="button"
          className="file-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
          title="Share file"
        >
          {uploadingFile ? '⏳' : '📎'}
        </button>

        <button
          type="submit"
          disabled={!message.trim() || uploadingFile}
          className="send-btn"
        >
          {uploadingFile ? '⏳' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default MessageForm;

