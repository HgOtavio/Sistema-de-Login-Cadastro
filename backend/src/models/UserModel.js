// Model responsável por interagir com o banco de dados SQLite — CRUD de usuários
const db = require("../database/init");
const bcrypt = require("bcryptjs");

module.exports = {

  // Retorna todos os usuários cadastrados
  getAll(callback) {
    db.all("SELECT * FROM users", [], callback);
  },

  // Busca usuário por ID
  getById(id, callback) {
    db.get("SELECT * FROM users WHERE id = ?", [id], callback);
  },

  // Busca usuário pelo email — usado no login e no cadastro
  getByEmail(email, callback) {
    db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  // Cria um novo usuário no banco com hash de senha e timestamps
  create(user, callback) {
    const sql = `
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      user.name,
      user.email,
      user.password,
      user.role,
      user.created_at,
      user.updated_at
    ], callback);
  },

  // Atualiza nome e/ou senha (criptografada) e o timestamp
  updateUser(id, user, callback) {
    let fields = [];
    let values = [];

    if (user.name) {
      fields.push("name = ?");
      values.push(user.name);
    }

    if (user.password) {
      const hash = bcrypt.hashSync(user.password, 10);
      fields.push("password = ?");
      values.push(hash);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.run(sql, values, callback);
  },

  // Remove usuário do banco
  remove(id, callback) {
    db.run("DELETE FROM users WHERE id = ?", [id], callback);
  }
};
