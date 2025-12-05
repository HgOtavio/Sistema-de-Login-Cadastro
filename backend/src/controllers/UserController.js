const UserRepository = require("../database/UserRepository");
const { validarEmail, validarSenha } = require("../utils/validators");

module.exports = {

  list(req, res) {
    UserRepository.getAll((err, rows) => {
      return res.json(rows);
    });
  },

get(req, res) {
  try {
    const id = req.query.id;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório na query string (?id=1 ou ?id=1,2,3)" });
    }

    // Divide IDs por vírgula e converte para número
    const ids = id.split(",").map((i) => Number(i.trim()));

    // Validação: todos devem ser números
    if (ids.some((value) => isNaN(value))) {
      return res.status(400).json({ error: "IDs inválidos. Use números, ex: ?id=1 ou ?id=1,2,3" });
    }

    // Chama REPOSITORY
    UserRepository.getByIds(ids, (err, rows) => {
      if (err) {
        console.error("Erro no banco de dados:", err);
        return res.status(500).json({ error: "Erro ao consultar usuários" });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "Usuário(s) não encontrado(s)" });
      }

      // Nunca envie senha
      rows.forEach((u) => delete u.password);

      return res.status(200).json(rows);
    });

  } catch (error) {
    console.error("Erro inesperado no controller get:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}
,
async update(req, res) {
  try {
    const { id } = req.params;

    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({ error: "Body JSON inválido ou ausente. Use { }" });
    }

    const { name, password, role, email } = req.body;

    // Permissões
    if (req.user.role !== "admin" && req.user.id != id) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    UserRepository.getById(id, (err, userDb) => {
      if (err) return res.status(500).json({ error: "Erro ao buscar usuário" });
      if (!userDb) return res.status(404).json({ error: "Usuário não encontrado" });

      const now = Date.now();
      const lastUpdate = Number(userDb.last_update) || 0;
      let updateCount = Number(userDb.update_count) || 0;

      const diff = now - lastUpdate;
      const LIMIT = 24 * 60 * 60 * 1000; // 24h

      // Reseta após 24h
      if (diff > LIMIT) updateCount = 0;

      const next_reset = new Date(lastUpdate + LIMIT).toLocaleString("pt-BR");

      /** ROLE **/
      let newRole = userDb.role;
      let roleMessage = "";

      if (req.user.role === "admin" && role) {
        newRole = role;
        roleMessage = `Role alterado para '${newRole}' pelo admin.`;
      } else if (req.user.role === "user" && role) {
        roleMessage = `Usuário normal não pode alterar o role. Mantido '${newRole}'.`;
      }

      // Validações (vindo do utils)
      if (email && !validarEmail(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }

      if (password && !validarSenha(password)) {
        return res.status(400).json({
          error:
            "Senha inválida: mínimo 12 caracteres, uma letra maiúscula, uma minúscula e um caractere especial."
        });
      }

      // Função final
      const atualizarUser = () => {
        const changes = [];
        if (name && name !== userDb.name) changes.push("Nome alterado");
        if (email && email !== userDb.email) changes.push("Email alterado");
        if (password) changes.push("Senha alterada");
        if (newRole !== userDb.role) changes.push("Role alterado");

        const houveMudanca = changes.length > 0;

        // Cálculo de limite de tentativas
        const tentativaCount = updateCount + (houveMudanca ? 1 : 0);

        if (req.user.role === "user" && tentativaCount > 2) {
          return res.status(403).json({
            error: "Limite de 2 edições em 24 horas atingido. Usuário não foi atualizado.",
            next_reset
          });
        }

        const newUpdateCount = houveMudanca ? updateCount + 1 : updateCount;
        const updates_left = 2 - newUpdateCount;

        const updatedData = {
          name: name || userDb.name,
          password: password || userDb.password,
          email: email || userDb.email,
          role: newRole,
          last_update: now,
          update_count: newUpdateCount
        };

        UserRepository.updateUser(id, updatedData, (err) => {
          if (err) {
            return res.status(500).json({ error: "Erro ao atualizar usuário" });
          }

          const next_reset_at = new Date(lastUpdate + LIMIT).toLocaleString("pt-BR");

          return res.json({
            message: houveMudanca
              ? "Usuário atualizado com sucesso!"
              : "Nenhuma alteração foi realizada.",
            roleMessage,
            changes: houveMudanca ? changes : ["Nenhuma mudança detectada"],
            updates_left,
            next_reset_at
          });
        });
      };

      // Checagem de email duplicado
      if (email) {
        UserRepository.getByEmail(email, (err, found) => {
          if (err) return res.status(500).json({ error: "Erro ao validar email" });

          if (found && found.id != id) {
            return res.status(400).json({ error: "Este email já está em uso" });
          }

          return atualizarUser();
        });
      } else {
        return atualizarUser();
      }
    });
  } catch (err) {
    console.log("Erro inesperado:", err);
    return res.status(500).json({ error: "Erro inesperado ao atualizar usuário" });
  }
}


,

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
