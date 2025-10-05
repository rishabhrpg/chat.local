import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import authService from './services/authService';
import type { User } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize authentication
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);

      // Check if user is already authenticated
      const isValid = await authService.verifyToken();

      if (isValid) {
        const userData = authService.getUser();
        setUser(userData);
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    initializeApp();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    setUser(result.user);
    setIsAuthenticated(true);
  };

  const handleRegister = async (username: string, password: string) => {
    const result = await authService.register(username, password);
    setUser(result.user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-card">
          <h1>🏠 Local Chat</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
            ) : (
              <Navigate to="/chat" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            isAuthenticated && user ? (
              <ChatPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? '/chat' : '/login'} replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
