import apiClient from './api';
import type { AuthResponse, User } from '../types';

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.token = localStorage.getItem('chat_token');
    const userStr = localStorage.getItem('chat_user');
    this.user = userStr ? JSON.parse(userStr) : null;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login', {
        username,
        password,
      });

      this.setAuth(response.data.token, response.data.user);
      return response.data;
    } catch (error) {
      const message = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data && 
        typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : 'Login failed';
      throw new Error(message);
    }
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register', {
        username,
        password,
      });

      this.setAuth(response.data.token, response.data.user);
      return response.data;
    } catch (error) {
      const message = error instanceof Error && 'response' in error && 
        error.response && typeof error.response === 'object' && 
        'data' in error.response && error.response.data && 
        typeof error.response.data === 'object' && 'error' in error.response.data
        ? String(error.response.data.error)
        : 'Registration failed';
      throw new Error(message);
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await apiClient.get<{ valid: boolean; user: User }>(
        '/api/auth/verify'
      );

      if (response.data.valid) {
        this.user = response.data.user;
        localStorage.setItem('chat_user', JSON.stringify(response.data.user));
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      this.clearAuth();
      return false;
    }
  }

  setAuth(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_user', JSON.stringify(user));
  }

  clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

const authService = new AuthService();
export default authService;

