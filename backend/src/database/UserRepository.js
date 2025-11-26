// repositories/UserRepository.js
const db = require("../database/init");
const bcrypt = require("bcryptjs");

module.exports = {

  getAll(callback) {
    db.all("SELECT * FROM users", [], callback);
  },

  getById(id, callback) {
    db.get("SELECT * FROM users WHERE id = ?", [id], callback);
  },

  getByEmail(email, callback) {
    db.get("SELECT * FROM users WHERE email = ?", [email], callback);
  },

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

  updateUser(id, user, callback) {
    let fields = [];
    let values = [];

    if (user.name) {
      fields.push("name = ?");
      values.push(user.name);
    }

    if (user.email) {
      fields.push("email = ?");
      values.push(user.email);
    }

    if (user.password) {
      const hash = bcrypt.hashSync(user.password, 10);
      fields.push("password = ?");
      values.push(hash);
    }

    if (user.role) {
      fields.push("role = ?");
      values.push(user.role);
    }

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.run(sql, values, callback);
  },

  remove(id, callback) {
    db.run("DELETE FROM users WHERE id = ?", [id], callback);
  }
};
