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
  const checkSql = `
    SELECT reset_token, reset_token_expire 
    FROM users 
    WHERE email = ?
  `;

  db.get(checkSql, [email], (err, row) => {
    if (err) {
      console.error("Erro ao consultar reset_token existente:", err);
      return callback(err);
    }

    if (row && row.reset_token && row.reset_token_expire) {

      // arruma formato de data
      const raw = String(row.reset_token_expire).trim();
      const iso = raw.replace(" ", "T");
      const expireTime = new Date(iso);
      const now = new Date();

      // verifica se interpretou corretamente
      if (!isNaN(expireTime.getTime())) {
        if (expireTime > now) {
          console.log("Já existe um token ativo, ainda não expirou!");
          return callback(null, {
            alreadyHasToken: true,
            message: "Você já possui um token ativo. Verifique seu email."
          });
        }
      } else {
        console.warn("⚠ reset_token_expire inválido, substituindo…");
      }
    }

    // grava novo token
    const sql = `
      UPDATE users 
      SET reset_token = ?, 
          reset_token_expire = DATETIME('now', '+15 minutes')
      WHERE email = ?
    `;
    
    db.run(sql, [token, email], function(err) {
      if (err) {
        console.error("Erro ao salvar reset_token:", err);
        return callback(err);
      }

      console.log(`Novo reset token salvo para ${email}, linhas afetadas:`, this.changes);
      callback(null, { 
        alreadyHasToken: false,
        message: "Token gerado com sucesso."
      });
    });
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

    if (row) {
      console.log(`Token ${token} para ${email} é válido.`);
      return callback(null, true);
    }

    console.log(`Token ${token} para ${email} é inválido ou expirou.`);
    return callback(null, false);
  });
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
}, 

checkExistingValidToken(email, callback) {
  const sql = `
    SELECT reset_token_expire
    FROM users
    WHERE email = ? AND reset_token_expire > DATETIME('now')
  `;

  db.get(sql, [email], (err, row) => {
    if (err) {
      console.error("Erro ao verificar token existente:", err);
      return callback(err, null);
    }

    const exists = !!row; // true se encontrou token ainda válido
    console.log("🔹 checkExistingValidToken:", exists);
    callback(null, exists);
  });
}


  

  };
