const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Bonjour } = require('bonjour-service');
const bonjour = new Bonjour();
const config = require('../config');

// Import routes
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const fileRoutes = require('./routes/files');

// Import services
const SocketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Initialize socket service
const socketService = new SocketService(io);

// API Routes
app.get('/api/config', (req, res) => {
  res.json({
    PORT: config.PORT,
    SERVICE_NAME: config.SERVICE_NAME,
    MDNS_HOSTNAME: config.MDNS_HOSTNAME,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
  });
});

// Use route modules
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Socket handling is now managed by SocketService

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
