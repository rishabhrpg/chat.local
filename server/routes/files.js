const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');
const router = express.Router();

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

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
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
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(config.UPLOAD_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(path.resolve(filePath));
});

// File download endpoint
router.get('/download/:filename', (req, res) => {
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

module.exports = router;
