const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath);


// Initialize tables
db.serialize(() => {
db.run('PRAGMA foreign_keys = ON;');
db.run(`CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`);
});


module.exports = db;