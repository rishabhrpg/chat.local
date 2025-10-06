# Environment Configuration Guide

This application uses environment variables for all important configuration. This guide explains how to set up and customize your environment.

## Quick Start

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your specific values

3. Start the application (it will automatically load your `.env` file)

## Configuration Variables

### Server Configuration

- **PORT** (default: `80`)
  - The port the server will listen on
  - Set to a higher port (e.g., 3000) if you need to run without sudo

- **HOST** (default: `0.0.0.0`)
  - The host interface to bind to
  - `0.0.0.0` allows connections from all network interfaces

- **NODE_ENV** (default: `development`)
  - Application environment mode
  - Options: `development`, `production`, `test`

### Database Configuration

- **DB_PATH** (default: `./server/chat.db`)
  - Path to the SQLite database file
  - Can be absolute or relative to project root

### Security Configuration

- **JWT_SECRET** (default: `your-secret-key-change-in-production`)
  - Secret key for JWT token signing
  - **IMPORTANT**: Change this in production to a strong, random string
  - Generate a secure secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

- **JWT_EXPIRES_IN** (default: `7d`)
  - JWT token expiration time
  - Examples: `1h`, `24h`, `7d`, `30d`

- **BCRYPT_ROUNDS** (default: `10`)
  - Number of bcrypt hashing rounds for passwords
  - Higher is more secure but slower (typically 10-12)

### mDNS Configuration

- **SERVICE_NAME** (default: `Local Chat`)
  - The name advertised via mDNS on the local network
  - Helps users discover your chat service

- **MDNS_HOSTNAME** (default: `chat.local`)
  - The hostname for mDNS resolution
  - Accessible at `http://chat.local:PORT`

### File Upload Configuration

- **UPLOAD_DIR** (default: `./uploads`)
  - Directory where uploaded files are stored
  - Ensure this directory has proper write permissions

- **MAX_FILE_SIZE** (default: `52428800` - 50MB)
  - Maximum file upload size in bytes
  - Examples: 10MB = 10485760, 100MB = 104857600

- **ALLOWED_FILE_TYPES** (default: `image/*,text/*,application/pdf,application/zip,.doc,.docx,.xls,.xlsx`)
  - Comma-separated list of allowed MIME types and extensions

### CORS Configuration

- **CORS_ORIGIN** (default: `*`)
  - Allowed origins for CORS requests
  - Use `*` for development, specify domains in production
  - Example: `https://yourdomain.com,https://app.yourdomain.com`

- **SOCKET_CORS_ORIGIN** (default: `*`)
  - Allowed origins for Socket.IO connections
  - Usually same as CORS_ORIGIN

### Message Configuration
- **MESSAGE_LIMIT** (default: `100`)
  - Default number of messages to retrieve from the database
  - Can be overridden with query parameters in API requests

## Production Best Practices

### Security

1. **Change JWT_SECRET**: Generate a strong, random secret key
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Set NODE_ENV**: Always set to `production` in production environments
   ```
   NODE_ENV=production
   ```

3. **Configure CORS**: Restrict CORS to your specific domains
   ```
   CORS_ORIGIN=https://yourdomain.com
   SOCKET_CORS_ORIGIN=https://yourdomain.com
   ```

### Performance

1. **BCRYPT_ROUNDS**: Use 10-12 rounds for a balance of security and performance
2. **MESSAGE_LIMIT**: Adjust based on your typical usage patterns
3. **MAX_FILE_SIZE**: Set based on your storage and bandwidth capabilities

### File Storage

1. **UPLOAD_DIR**: Consider using an absolute path in production
2. Ensure the upload directory has proper permissions
3. Set up regular backups of uploaded files
4. Consider cloud storage for production deployments

## Example Configurations

### Development (Low Security, Easy Access)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key
CORS_ORIGIN=*
```

### Production (High Security)
```env
PORT=80
NODE_ENV=production
JWT_SECRET=your-secure-random-64-character-hex-string
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
SOCKET_CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=10485760
```

### Local Network Only
```env
PORT=80
HOST=0.0.0.0
SERVICE_NAME=Family Chat
MDNS_HOSTNAME=family-chat.local
CORS_ORIGIN=*
```

## Troubleshooting

### Port Already in Use
If port 80 is in use, change to a higher port:
```env
PORT=3000
```

### JWT Token Issues
If users are getting logged out, check:
- JWT_SECRET hasn't changed
- JWT_EXPIRES_IN is set to an appropriate value

### File Upload Failures
Check:
- UPLOAD_DIR exists and has write permissions
- MAX_FILE_SIZE is sufficient for your files
- File type is allowed in ALLOWED_FILE_TYPES

### Connection Issues
If clients can't connect:
- Ensure HOST is set to `0.0.0.0`
- Check firewall settings for your PORT
- Verify CORS_ORIGIN includes your client domain
