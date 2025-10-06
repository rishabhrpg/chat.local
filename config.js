/**
 * Application Configuration
 * Loads environment variables from .env file and provides defaults
 * All configuration should be managed through environment variables
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: parseInt(process.env.PORT) || 80,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DB_PATH: process.env.DB_PATH || './server/chat.db',
  
  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  
  // mDNS Configuration
  SERVICE_NAME: process.env.SERVICE_NAME || 'Local Chat',
  MDNS_HOSTNAME: process.env.MDNS_HOSTNAME || 'chat.local',
  
  // File Upload Configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB default
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/*,text/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Socket.IO Configuration
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '*',
  
  // Message Configuration
  MESSAGE_LIMIT: parseInt(process.env.MESSAGE_LIMIT) || 100,
};
