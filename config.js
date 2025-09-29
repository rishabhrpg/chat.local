/**
 * Simple Configuration
 * Environment variables take priority over defaults
 */

module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  
  // Database
  DB_PATH: process.env.DB_PATH || './server/chat.db',
  
  // mDNS
  SERVICE_NAME: process.env.SERVICE_NAME || 'Local Chat',
  MDNS_HOSTNAME: process.env.MDNS_HOSTNAME || 'chat.local',
  
  // File Upload
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/*,text/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx',
};
