const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await db.getAllMessages();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages by user
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const messages = await db.getMessagesByUser(username);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({ error: 'Failed to fetch user messages' });
  }
});

// Clear all messages (admin only)
router.delete('/', async (req, res) => {
  try {
    const result = await db.clearMessages();
    res.json({ message: `Cleared ${result.deleted} messages` });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});

module.exports = router;
