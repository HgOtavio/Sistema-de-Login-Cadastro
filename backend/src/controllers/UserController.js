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

  update(req, res) {
    const now = new Date().toISOString();

    User.update(req.params.id, { ...req.body, updated_at: now }, function(err) {
      if (err) return res.status(500).json({ error: "Erro ao atualizar" });
      return res.json({ message: "Atualizado com sucesso" });
    });
  },

  remove(req, res) {
    User.remove(req.params.id, function(err) {
      if (err) return res.status(500).json({ error: "Erro ao deletar" });
      return res.json({ message: "Removido com sucesso" });
    });
  }
};
