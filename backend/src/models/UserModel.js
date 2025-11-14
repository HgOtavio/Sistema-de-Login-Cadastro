const db = require("../database/init");

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

  update(id, user, callback) {
    const sql = `
      UPDATE users SET name=?, email=?, role=?, updated_at=?
      WHERE id=?
    `;
    db.run(sql, [
      user.name,
      user.email,
      user.role,
      user.updated_at,
      id
    ], callback);
  },

  remove(id, callback) {
    db.run("DELETE FROM users WHERE id = ?", [id], callback);
  }
};
