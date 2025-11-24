// Importa o model de usuário, responsável por acessar o banco
const User = require("../models/UserModel");

module.exports = {

  // Retorna todos os usuários do sistema
  list(req, res) {
    User.getAll((err, rows) => {
      return res.json(rows);
    });
  },

  // Retorna um usuário específico pelo ID
  get(req, res) {
    User.getById(req.params.id, (err, row) => {
      if (!row) return res.status(404).json({ error: "Usuário não encontrado" });
      return res.json(row);
    });
  },

  // Atualiza nome e/ou senha de um usuário
  // - Admin pode editar qualquer usuário
  // - Usuário comum só pode editar ele mesmo
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, password } = req.body;

      // Controle de permissão baseado no JWT
      if (req.user.role !== "admin" && req.user.id != id) {
        return res.status(403).json({ error: "Sem permissão" });
      }

      User.getById(id, (err, row) => {
        if (!row) return res.status(404).json({ error: "Usuário não encontrado" });

        User.updateUser(id, { name, password }, (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Erro ao atualizar usuário" });
          }
          return res.json({ message: "Usuário atualizado com sucesso" });
        });
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Erro interno" });
    }
  },

  // Remove um usuário do sistema
  remove(req, res) {
    User.remove(req.params.id, function(err) {
      if (err) return res.status(500).json({ error: "Erro ao deletar" });
      return res.json({ message: "Removido com sucesso" });
    });
  }

};
