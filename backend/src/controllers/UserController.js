const User = require("../models/UserModel");

module.exports = {

  list(req, res) {
    User.getAll((err, rows) => {
      return res.json(rows);
    });
  },

  get(req, res) {
    User.getById(req.params.id, (err, row) => {
      if (!row) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.json(row);
    });
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, password, role } = req.body;

      // Se não é admin e está tentando editar outro usuário -> bloqueia
      if (req.user.role !== "admin" && req.user.id != id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      User.getById(id, (err, row) => {
        if (!row) return res.status(404).json({ error: "Usuário não encontrado" });

        let newRole = role;

        // Se NÃO é admin -> NÃO pode mudar role
        if (req.user.role !== "admin") {
          newRole = row.role;
        }

        User.updateUser(
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

  User.remove(userId, function(err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar" });
    return res.json({ message: "Removido com sucesso" });
  });
}

};
