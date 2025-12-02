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

    getByIds(ids, callback) {
      if (!Array.isArray(ids) || ids.length === 0) {
        return callback(null, []);
      }

      const placeholders = ids.map(() => "?").join(",");
      const sql = `SELECT * FROM users WHERE id IN (${placeholders})`;
      db.all(sql, ids, callback);
    },

    getByEmail(email, callback) {
      db.get("SELECT * FROM users WHERE email = ?", [email], callback);
    },

    create(user, callback) {
      const sql = `
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.run(
        sql,
        [user.name, user.email, user.password, user.role, user.created_at, user.updated_at],
        callback
      );
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
        // Para atualizações normais de usuário, hash aqui
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

      db.run(sql, values, function(err) {
        if (err) {
          console.error("Erro no SQLite ao atualizar usuário:", err);
        } else {
          console.log("updateUser: Linhas afetadas:", this.changes);
        }
        callback(err);
      });
    },

    remove(id, callback) {
      db.run("DELETE FROM users WHERE id = ?", [id], callback);
    },

    saveResetToken(email, token, callback) {
      const sql = `
        UPDATE users 
        SET reset_token = ?, 
            reset_token_expire = DATETIME('now', '+15 minutes')
        WHERE email = ?
      `;
      db.run(sql, [token, email], function(err) {
        if (err) console.error("Erro ao salvar reset_token:", err);
        else console.log(`Reset token salvo para ${email}, linhas afetadas:`, this.changes);
        callback(err);
      });
    },

    validateResetToken(email, token, callback) {
      const sql = `
        SELECT id FROM users 
        WHERE email = ? 
        AND reset_token = ? 
        AND reset_token_expire > DATETIME('now')
      `;

      db.get(sql, [email, token], (err, row) => {
        if (err) {
          console.error("Erro ao validar reset_token:", err);
          return callback(err, null);
        }
        const valid = !!row;
        console.log(`Token ${token} para ${email} é válido?`, valid);
        callback(null, valid);
      });
    },

  async resetPassword(req, res) {
    try {
      const { email, token, password } = req.body;

      if (!email || !token || !password) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      UserRepository.validateResetToken(email, token, (err, valid) => {
        if (err) {
          return res.status(500).json({ error: "Erro ao processar token" });
        }

        if (!valid) {
          return res.status(400).json({ error: "Token inválido" });
        }

        // Aqui passa a senha pura
        UserRepository.updatePassword(email, password, (err) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao atualizar senha" });
          }

          return res.json({ message: "Senha alterada com sucesso!" });
        });
      });

    } catch (error) {
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  },
  
  updateUserPassword(id, hashedPassword, callback) {
  const sql = `UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?`;

  db.run(sql, [hashedPassword, id], function (err) {
    if (err) {
      console.error("Erro ao atualizar senha:", err);
      return callback(err);
    }
    return callback(null);
  });
}

  

  };
