const User = require("../models/UserModel");
const UserRepository = require("../database/UserRepository");

module.exports = {

  list(req, res) {
    UserRepository.getAll((err, rows) => {
      return res.json(rows);
    });
  },

  get(req, res) {
    UserRepository.getById(req.params.id, (err, row) => {
      if (!row) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.json(row);
    });
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, password, role, email } = req.body;

      if (req.user.role !== "admin" && req.user.id != id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      UserRepository.getById(id, (err, userDb) => {
        if (!userDb) return res.status(404).json({ error: "Usuário não encontrado" });

        let newRole = role;
        if (req.user.role !== "admin") {
          newRole = userDb.role;
        }

        if (email) {
          UserRepository.getByEmail(email, (err, userWithEmail) => {
            if (userWithEmail && userWithEmail.id != id) {
              return res.status(400).json({ error: "Este email já está em uso" });
            }

            UserRepository.updateUser(
              id,
              { name, password, role: newRole, email },
              (err) => {
                if (err) {
                  console.log(err);
                  return res.status(500).json({ error: "Erro ao atualizar usuário" });
                }
                return res.json({ message: "Usuário atualizado com sucesso" });
              }
            );
          });
        } else {
          UserRepository.updateUser(
            id,
            { name, password, role: newRole },
            (err) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Erro ao atualizar usuário" });
              }
              return res.json({ message: "Usuário atualizado com sucesso" });
            }
          );
        }
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Erro interno" });
    }
  },

  remove(req, res) {
    const userId = req.params.id;

    if (req.user.role !== "admin" && req.user.id != userId) {
      return res.status(403).json({ error: "Sem permissão para deletar este usuário" });
    }

    UserRepository.remove(userId, function(err) {
      if (err) return res.status(500).json({ error: "Erro ao deletar" });
      return res.json({ message: "Removido com sucesso" });
    });
  }

};
