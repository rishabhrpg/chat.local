import React, { useState } from 'react';
import LoginModal from '../../components/LoginModal';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (username: string, password: string) => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏠 Local Chat</h1>
        <p>Join the local network chat</p>
        <button className="login-btn" onClick={() => setShowLoginModal(true)}>
          Login / Create Account
        </button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={onLogin}
        onRegister={onRegister}
      />
    </div>
  );
};

export default LoginPage;

