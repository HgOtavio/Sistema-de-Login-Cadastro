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
      reset_token TEXT,
      reset_token_expire TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);


  db.all(`PRAGMA table_info(users)`, (err, rows) => {
    if (err || !rows) {
      console.error(" Erro ao consultar PRAGMA:", err);
      return;
    }

    const colunas = rows.map(col => col.name);

    if (!colunas.includes("reset_token")) {
      console.log(" Adicionando reset_token");
      db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
    }
    

    if (!colunas.includes("reset_token_expire")) {
      console.log(" Adicionando reset_token_expire");
      db.run(`ALTER TABLE users ADD COLUMN reset_token_expire TEXT`);
    }
  });
});
const bcrypt = require("bcryptjs");
console.log( bcrypt.hashSync("12345678A!Po", 10) );


module.exports = db;

