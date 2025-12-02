const UserRepository = require("../database/UserRepository");

module.exports = {

  list(req, res) {
    UserRepository.getAll((err, rows) => {
      return res.json(rows);
    });
  },

 get(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório" });
    }

    // Se vier dois IDs separados por vírgula
    const ids = id.split(",").map((i) => parseInt(i.trim()));

    if (ids.some(isNaN)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    // Função do repository que retorna múltiplos ou 1 usuário
    UserRepository.getByIds(ids, (err, rows) => {
      if (err) {
        console.error("Erro SQL:", err);
        return res.status(500).json({ error: "Erro ao consultar usuários" });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Usuário(s) não encontrado(s)" });
      }

      return res.json(rows);
    });

  } catch (error) {
    console.error("Erro crítico no get:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
},

  async update(req, res) {
  try {
    const { id } = req.params;

    // Verificação se o body possui chaves JSON "{}"
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "Body JSON inválido ou ausente. Use { }" });
    }

    const { name, password, role, email } = req.body;

    console.log(" JSON RECEBIDO:", req.body);

    if (req.user.role !== "admin" && req.user.id != id) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    UserRepository.getById(id, (err, userDb) => {

      if (err) {
        console.log(" Erro DB:", err);
        return res.status(500).json({ error: "Erro no banco ao buscar usuário" });
      }

      if (!userDb) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      let newRole = role;
      if (req.user.role !== "admin") newRole = userDb.role;

      if (email) {
        UserRepository.getByEmail(email, (err, userWithEmail) => {

          if (err) {
            console.log(" Erro DB:", err);
            return res.status(500).json({ error: "Erro no banco ao validar email" });
          }

          if (userWithEmail && userWithEmail.id != id) {
            return res.status(400).json({ error: "Este email já está em uso" });
          }

          return atualizarUser();
        });
      } else {
        return atualizarUser();
      }

      function atualizarUser() {
        UserRepository.updateUser(
          id,
          { name, password, role: newRole, email },
          (err) => {

            if (err) {
              console.log(" Erro DB ao atualizar:", err);
              return res.status(500).json({ error: "Erro ao atualizar usuário" });
            }

            return res.json({ message: "Usuário atualizado com sucesso!" });
          }
        );
      }

    });

  } catch (err) {
    console.log(" ERRO GERAL:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
},


remove(req, res) {
  try {
    const idsParam = req.params.id;

    if (!idsParam) {
      return res.status(400).json({ error: "ID é obrigatório" });
    }

    // Suporta múltiplos IDs separados por vírgula
    const ids = idsParam.split(",").map(i => parseInt(i.trim()));

    if (ids.some(isNaN)) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    // Se não for admin, só pode deletar o próprio ID
    if (req.user.role !== "admin") {
      if (ids.length > 1 || ids[0] != req.user.id) {
        return res.status(403).json({ error: "Sem permissão para deletar esses usuários" });
      }
    }

    // Função para deletar todos os IDs sequencialmente
    const deleteNext = (index) => {
      if (index >= ids.length) {
        return res.json({ message: "Usuário(s) removido(s) com sucesso" });
      }

      UserRepository.getById(ids[index], (err, userDb) => {
        if (err) {
          console.error("Erro ao buscar usuário:", err);
          return res.status(500).json({ error: "Erro ao buscar usuário" });
        }
        if (!userDb) {
          return res.status(404).json({ error: `Usuário com ID ${ids[index]} não encontrado` });
        }

        UserRepository.remove(ids[index], (err) => {
          if (err) {
            console.error("Erro ao deletar usuário:", err);
            return res.status(500).json({ error: `Erro ao deletar usuário ${ids[index]}` });
          }
          deleteNext(index + 1); // Próximo ID
        });
      });
    };

    deleteNext(0);

  } catch (error) {
    console.error("Erro crítico no remove:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}



};
