class AuthService {
  constructor() {
    this.token = localStorage.getItem('chat_token');
    this.user = JSON.parse(localStorage.getItem('chat_user') || 'null');
  }

  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(username, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.setAuth(data.token, data.user);
      return data;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        this.user = data.user;
        localStorage.setItem('chat_user', JSON.stringify(data.user));
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

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_user', JSON.stringify(user));
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
  }

  isAuthenticated() {
    return !!(this.token && this.user);
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

const authService = new AuthService();
export default authService;
