export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Message {
  id?: number;
  username: string;
  message: string;
  timestamp: string | number;
  message_type?: 'text' | 'file';
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  type?: 'system' | 'user';
}

export interface SocketAuthData {
  token: string;
}

export interface SocketMessageData {
  message: string;
  message_type?: 'text' | 'file';
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
}

export interface SocketTypingData {
  username: string;
}

export interface FileUploadResponse {
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
}

