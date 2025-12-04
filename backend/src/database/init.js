require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database(process.env.DB_PATH, (err) => {
  if (err) {
    console.error("Erro ao conectar no banco SQLite:", err);
  } else {
    console.log("Conectado ao banco:", process.env.DB_PATH);
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
      updated_at TEXT NOT NULL,
      last_update INTEGER DEFAULT 0,
      update_count INTEGER DEFAULT 0
    )
  `);

  db.all(`PRAGMA table_info(users)`, (err, rows) => {
    if (err || !rows) {
      console.error("Erro ao consultar PRAGMA:", err);
      return;
    }

    const colunas = rows.map(col => col.name);

    const adicionarColuna = (nome, tipo, valorPadrao = null) => {
      if (!colunas.includes(nome)) {
        const sql = valorPadrao
          ? `ALTER TABLE users ADD COLUMN ${nome} ${tipo} DEFAULT ${valorPadrao}`
          : `ALTER TABLE users ADD COLUMN ${nome} ${tipo}`;
        db.run(sql);
      }
    };

    adicionarColuna("reset_token", "TEXT");
    adicionarColuna("reset_token_expire", "TEXT");
    adicionarColuna("last_update", "INTEGER", 0);
    adicionarColuna("update_count", "INTEGER", 0);
  });

 
  const adminName = process.env.ADMIN_NAME ;
  const adminEmail = process.env.ADMIN_EMAIL ;
  const adminPasswordPlain = process.env.ADMIN_PASSWORD ;

  const adminPassword = bcrypt.hashSync(adminPasswordPlain, 10);
  const now = new Date().toISOString();

  db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], (err, row) => {
    if (err) {
      console.error("Erro ao verificar admin:", err);
      return;
    }

    if (!row) {
      db.run(
        `
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, 'admin', ?, ?)
        `,
        [adminName, adminEmail, adminPassword, now, now],
        (err) => {
          if (err) {
            console.error("Erro ao criar admin:", err);
          } else {
            console.log("Admin padrão criado.");
          }
        }
      );
    } else {
      console.log("Admin já existe.");
    }
  });
});

module.exports = db;
