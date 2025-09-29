# 🏠 Local Chat Application

A simple real-time chat application for local networks built with Node.js, Socket.IO, SQLite, and React.

## Features

- 🔐 **User Authentication** - Secure login/register system with JWT tokens
- 💬 Real-time messaging with Socket.IO
- 🗄️ Message persistence with SQLite database
- 👥 User join/leave notifications
- ⌨️ Typing indicators
- 📁 **File sharing support** - Upload and share files with drag & drop
- 🖼️ **Image preview** - Images display inline in chat
- ⬇️ **File downloads** - Easy download of shared files
- 📱 Responsive design
- 🌐 Local network accessibility with mDNS
- 🎨 Modern, beautiful UI
- 🐳 Docker containerization support
- 📡 mDNS service discovery (chat.local)
- 🔒 **Persistent Login** - Stay logged in across browser sessions

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Socket.IO
- SQLite3
- JWT Authentication
- bcryptjs (Password Hashing)
- mDNS (Bonjour Service)

**Frontend:**
- React
- Socket.IO Client
- Modern CSS with animations

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - React development server on `http://localhost:3002`

   **Or use the convenient start script:**
   ```bash
   ./start.sh
   ```

### Alternative Setup

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Start the backend server:**
   ```bash
   npm run server
   ```

4. **In a new terminal, start the frontend:**
   ```bash
   npm run client
   ```

## Production Build

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3001`

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the container:**
   ```bash
   docker-compose up -d
   ```

2. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Using Docker Commands

1. **Build the image:**
   ```bash
   npm run docker:build
   ```

2. **Run the container:**
   ```bash
   npm run docker:run
   ```

3. **Stop the container:**
   ```bash
   npm run docker:stop
   ```

### Manual Docker Commands

```bash
# Build
docker build -t local-chat .

# Run with host networking (required for mDNS)
docker run -p 3001:3001 --network host --name local-chat-app local-chat

# Stop
docker stop local-chat-app && docker rm local-chat-app
```

## Local Network Access

The server binds to `0.0.0.0`, making it accessible from other devices on your local network. With mDNS support, discovery is even easier!

### mDNS Access (Recommended)
- **Production/Docker:** `http://local-chat.local:3001`
- **Development:** `http://local-chat.local:3002`

### Manual IP Access
1. Find your local IP address:
   - **Windows:** `ipconfig`
   - **Mac/Linux:** `ifconfig` or `ip addr show`

2. Access the chat from other devices using:
   ```
   http://YOUR_LOCAL_IP:3001
   ```

   For example: `http://192.168.1.100:3001`

   **For development mode (React on port 3002):**
   ```
   http://YOUR_LOCAL_IP:3002
   ```

### mDNS Requirements
- **macOS/iOS:** Works out of the box
- **Windows:** Install Bonjour Print Services
- **Linux:** Install `avahi-daemon`
- **Android:** Use apps like "Service Browser" to discover services

## Authentication System

### Features
- **🔐 Secure Login/Register** - JWT-based authentication with bcrypt password hashing
- **🔒 Persistent Sessions** - Users stay logged in across browser sessions
- **👤 User Management** - Automatic account creation with username validation
- **🛡️ Protected Routes** - All chat functionality requires authentication
- **⚡ Real-time Auth** - Socket.IO connections are authenticated with JWT tokens

### How It Works
1. **First Visit:** User sees login screen with "Login / Create Account" button
2. **Account Creation:** If username doesn't exist, user can create new account
3. **Login:** If username exists, user enters password to login
4. **Auto-Login:** Returning users are automatically logged in if token is valid
5. **Session Management:** JWT tokens are stored in localStorage and verified on each request

### Security Features
- Passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 7 days (configurable)
- All API endpoints (except auth) require valid JWT token
- Socket.IO connections are authenticated before allowing chat access
- User sessions are tracked and updated on activity

## File Sharing

### Supported Features
- **📎 File Upload Button** - Click the paperclip icon to select files
- **🖱️ Drag & Drop** - Drag files directly into the chat area
- **🖼️ Image Preview** - Images display inline in the chat
- **⬇️ Download Files** - Click download button on any shared file
- **📊 File Info** - Shows filename and size for all files

### File Limits
- **Max file size:** 10MB (configurable via `MAX_FILE_SIZE` env var)
- **Supported types:** Images, documents, PDFs, text files, archives
- **Storage:** Files stored in `./uploads` directory

### Configuration
```bash
# Change file size limit (in bytes)
MAX_FILE_SIZE=20971520 npm start  # 20MB

# Change upload directory
UPLOAD_DIR=./my-files npm start

# Allowed file types (comma-separated)
ALLOWED_FILE_TYPES="image/*,application/pdf" npm start
```

## Project Structure

```
local-chat/
├── server/
│   ├── routes/          # API route modules
│   │   ├── auth.js      # Authentication endpoints
│   │   ├── messages.js  # Message endpoints
│   │   └── files.js     # File upload/download endpoints
│   ├── middleware/      # Express middleware
│   │   └── auth.js      # JWT authentication middleware
│   ├── services/        # Business logic services
│   │   └── socketService.js  # Socket.IO service with auth
│   ├── index.js         # Main Express server
│   ├── database.js      # SQLite database operations
│   └── chat.db         # SQLite database file (created automatically)
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── LoginModal.js    # Login/Register modal
│   │   │   └── LoginModal.css   # Modal styles
│   │   ├── services/    # Client services
│   │   │   └── authService.js   # Authentication service
│   │   ├── App.js       # Main React component
│   │   ├── App.css      # Styles
│   │   ├── index.js     # React entry point
│   │   └── index.css    # Global styles
│   └── package.json
├── uploads/             # File upload storage (created automatically)
├── config.js            # Centralized configuration
├── package.json         # Backend dependencies
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Messages
- `GET /api/messages` - Retrieve chat message history
- `GET /api/messages/user/:username` - Get messages by specific user
- `DELETE /api/messages` - Clear all messages (admin)

### Files
- `POST /api/files/upload` - Upload a file (multipart/form-data)
- `GET /api/files/:filename` - Serve uploaded files
- `GET /api/files/download/:filename` - Download files with original filename

### General
- `GET /api/config` - Get server configuration
- `GET /*` - Serve React app (production)

## Socket.IO Events

### Client to Server:
- `authenticate` - Authenticate with JWT token
- `send_message` - Send a new message
- `typing` - User is typing
- `stop_typing` - User stopped typing

### Server to Client:
- `authenticated` - Authentication successful
- `auth_error` - Authentication failed
- `receive_message` - New message received
- `user_joined` - User joined notification
- `user_left` - User left notification
- `user_typing` - User typing indicator
- `user_stop_typing` - User stopped typing

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  file_name TEXT,
  file_path TEXT,
  file_size INTEGER,
  file_type TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Scripts

### Development
- `npm run install-all` - Install all dependencies (backend + frontend)
- `npm run dev` - Start both backend and frontend in development
- `npm run server` - Start backend server only
- `npm run client` - Start frontend development server only

### Production
- `npm run build` - Build React app for production
- `npm start` - Start production server

### Docker
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:stop` - Stop and remove Docker container
- `npm run docker:compose:up` - Start with Docker Compose
- `npm run docker:compose:down` - Stop Docker Compose

## Customization

### Simple Configuration

All configuration is in `config.js` - environment variables take priority over defaults.

```javascript
module.exports = {
  PORT: process.env.PORT || 3001,           // Server port
  HOST: process.env.HOST || '0.0.0.0',     // Server host
  DB_PATH: process.env.DB_PATH || './server/chat.db',
  SERVICE_NAME: process.env.SERVICE_NAME || 'Local Chat',
  MDNS_HOSTNAME: process.env.MDNS_HOSTNAME || 'chat.local',
  CLIENT_PORT: process.env.CLIENT_PORT || 3002,
};
```

### Changing Ports

**Option 1: Environment Variables (Recommended)**
```bash
PORT=8080 npm start                    # Server on port 8080
REACT_APP_SERVER_PORT=8080 npm run client  # Client connects to 8080
```

**Option 2: Edit config.js**
```javascript
PORT: process.env.PORT || 8080,  // Change default port
```

**Option 3: Docker Environment**
```bash
docker run -e PORT=8080 -p 8080:8080 local-chat
```

### Database Configuration
- Database file: `server/chat.db`
- Modify `server/database.js` for custom database operations

### Styling
- Main styles: `client/src/App.css`
- Global styles: `client/src/index.css`

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Or use different port
   PORT=3001 npm start
   ```

2. **Cannot access from other devices:**
   - Check firewall settings
   - Ensure devices are on same network
   - Verify server is binding to `0.0.0.0`

3. **Database errors:**
   - Delete `server/chat.db` to reset database
   - Check file permissions

## License

MIT License - feel free to use this project for your local network chat needs!

## Contributing

Feel free to submit issues and enhancement requests!
