import apiClient from './api';
import type { Message, FileUploadResponse } from '../types';

class MessageService {
  async getMessages(): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[]>('/api/messages');
      return response.data;
    } catch (error) {
      console.error('Error loading messages:', error);
      throw new Error('Failed to load messages');
    }
  }

  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<FileUploadResponse>(
        '/api/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  getFileUrl(filePath: string): string {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/api/files/${filePath}`;
  }

  getDownloadUrl(filePath: string): string {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/api/files/download/${filePath}`;
  }
}

const messageService = new MessageService();
export default messageService;

