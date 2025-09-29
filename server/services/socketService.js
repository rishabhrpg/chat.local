const jwt = require('jsonwebtoken');
const Database = require('../database');

const db = new Database();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class SocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // Map of socketId -> user info
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          
          if (!token) {
            socket.emit('auth_error', { message: 'No token provided' });
            return;
          }

          const decoded = jwt.verify(token, JWT_SECRET);
          const user = await db.getUserById(decoded.userId);
          
          if (!user) {
            socket.emit('auth_error', { message: 'Invalid token' });
            return;
          }

          // Store user info in socket
          socket.userId = user.id;
          socket.username = user.username;
          
          // Store in connected users map
          this.connectedUsers.set(socket.id, {
            id: user.id,
            username: user.username,
            socketId: socket.id
          });

          // Update last seen
          await db.updateLastSeen(user.id);

          // Notify user of successful authentication
          socket.emit('authenticated', {
            user: {
              id: user.id,
              username: user.username
            }
          });

          // Notify other users that this user joined
          socket.broadcast.emit('user_joined', {
            username: user.username,
            message: `${user.username} joined the chat`,
            timestamp: new Date().toISOString(),
          });

          console.log(`User ${user.username} authenticated and joined`);
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      // Handle new messages
      socket.on('send_message', async (data) => {
        try {
          if (!socket.username) {
            socket.emit('error', 'Not authenticated');
            return;
          }

          const messageData = {
            username: socket.username,
            message: data.message,
            message_type: data.message_type || 'text',
            file_name: data.file_name || null,
            file_path: data.file_path || null,
            file_size: data.file_size || null,
            file_type: data.file_type || null,
            timestamp: new Date().toISOString(),
          };

          // Save message to database
          const savedMessage = await db.saveMessage(messageData);

          // Broadcast message to all clients
          this.io.emit('receive_message', savedMessage);
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', 'Failed to send message');
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        if (socket.username) {
          socket.broadcast.emit('user_typing', {
            username: socket.username,
            ...data
          });
        }
      });

      socket.on('stop_typing', (data) => {
        if (socket.username) {
          socket.broadcast.emit('user_stop_typing', {
            username: socket.username,
            ...data
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        if (socket.username) {
          // Remove from connected users
          this.connectedUsers.delete(socket.id);
          
          // Notify other users
          socket.broadcast.emit('user_left', {
            username: socket.username,
            message: `${socket.username} left the chat`,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getUserBySocketId(socketId) {
    return this.connectedUsers.get(socketId);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  sendToUser(username, event, data) {
    const user = Array.from(this.connectedUsers.values())
      .find(u => u.username === username);
    
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }
}

module.exports = SocketService;
