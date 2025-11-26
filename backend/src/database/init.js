require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error(" Erro ao conectar no banco SQLite:", err);
  } else {
    console.log(" Conectado ao banco:", process.env.DB_PATH);
  }
});



db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
});

module.exports = db;
