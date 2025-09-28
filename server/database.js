const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'chat.db');
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
        this.initDatabase();
      }
    });
  }

  initDatabase() {
    // First, create the table with original schema if it doesn't exist
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createMessagesTable, (err) => {
      if (err) {
        console.error('Error creating messages table:', err.message);
        return;
      }
      
      // Now add the new columns if they don't exist
      this.addFileColumns();
    });
  }

  addFileColumns() {
    const columnsToAdd = [
      { name: 'message_type', definition: 'TEXT DEFAULT \'text\'' },
      { name: 'file_name', definition: 'TEXT' },
      { name: 'file_path', definition: 'TEXT' },
      { name: 'file_size', definition: 'INTEGER' },
      { name: 'file_type', definition: 'TEXT' }
    ];

    let completedColumns = 0;
    const totalColumns = columnsToAdd.length;

    columnsToAdd.forEach(column => {
      const alterQuery = `ALTER TABLE messages ADD COLUMN ${column.name} ${column.definition}`;
      
      this.db.run(alterQuery, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Error adding column ${column.name}:`, err.message);
        }
        
        completedColumns++;
        if (completedColumns === totalColumns) {
          console.log('Messages table ready with file support');
        }
      });
    });
  }

  saveMessage(messageData) {
    return new Promise((resolve, reject) => {
      const { 
        username, 
        message, 
        timestamp, 
        message_type = 'text',
        file_name = null,
        file_path = null,
        file_size = null,
        file_type = null
      } = messageData;
      
      const sql = `INSERT INTO messages (username, message, message_type, file_name, file_path, file_size, file_type, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      
      this.db.run(sql, [username, message, message_type, file_name, file_path, file_size, file_type, timestamp], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            username,
            message,
            message_type,
            file_name,
            file_path,
            file_size,
            file_type,
            timestamp
          });
        }
      });
    });
  }

  getAllMessages(limit = 100) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, username, message, message_type, file_name, file_path, file_size, file_type, timestamp 
        FROM messages 
        ORDER BY timestamp ASC 
        LIMIT ?
      `;
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getMessagesByUser(username, limit = 50) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT id, username, message, timestamp 
        FROM messages 
        WHERE username = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `;
      
      this.db.all(sql, [username, limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.reverse());
        }
      });
    });
  }

  clearMessages() {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM messages`;
      
      this.db.run(sql, [], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes });
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;
