import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await onRegister(username.trim(), password);
      } else {
        await onLogin(username.trim(), password);
      }
      // Reset form on success
      setUsername('');
      setPassword('');
      setIsRegister(false);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setIsRegister(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isRegister ? 'Create Account' : 'Login'}</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              maxLength={20}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              minLength={6}
              required
              disabled={loading}
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? '⏳' : (isRegister ? 'Create Account' : 'Login')}
          </button>
        </form>
        
        <div className="modal-footer">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="switch-btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              disabled={loading}
            >
              {isRegister ? 'Login' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
