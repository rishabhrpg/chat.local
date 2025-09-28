const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Database = require('./database');
const { Bonjour } = require('bonjour-service');
const bonjour = new Bonjour();
const config = require('../config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = config.PORT;

// Initialize database
const db = new Database();

// Create uploads directory if it doesn't exist
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now - we'll validate on client side
    cb(null, true);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.get('/api/config', (req, res) => {
  res.json({
    PORT: config.PORT,
    SERVICE_NAME: config.SERVICE_NAME,
    MDNS_HOSTNAME: config.MDNS_HOSTNAME,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
  });
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.getAllMessages();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/api/files/${req.file.filename}`
    };

    res.json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// File serving endpoint
app.get('/api/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(config.UPLOAD_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(path.resolve(filePath));
});

// File download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(config.UPLOAD_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Extract original filename from the stored filename
  const parts = filename.split('-');
  const originalName = parts.slice(2).join('-'); // Remove timestamp and random part
  
  res.download(path.resolve(filePath), originalName);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('user_joined', {
      username,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const messageData = {
        username: data.username,
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
      io.emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.broadcast.emit('user_stop_typing', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.username) {
      socket.broadcast.emit('user_left', {
        username: socket.username,
        message: `${socket.username} left the chat`,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

// Serve React app for production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(PORT, config.HOST, () => {
  console.log(`Server running on http://${config.HOST}:${PORT}`);
  console.log(`Local network access available on all network interfaces`);

  // Advertise the service via mDNS
  const service = bonjour.publish({
    name: config.SERVICE_NAME,
    type: 'http',
    port: PORT,
    host: config.MDNS_HOSTNAME,
    txt: {
      path: '/',
      description: 'Local Network Chat Application',
    },
  });

  console.log(`🌐 mDNS service "${service.name}" published`);
  console.log(`📱 Access via: http://${config.MDNS_HOSTNAME}:${PORT}`);
  console.log(`🔗 Direct access: http://YOUR_IP:${PORT}`);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    bonjour.unpublishAll(() => {
      bonjour.destroy();
      server.close(() => {
        process.exit(0);
      });
    });
  });
});
