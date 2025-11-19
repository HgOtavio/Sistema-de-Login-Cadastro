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
    const { name, password } = req.body;

   
    if (req.user.role !== "admin" && req.user.id != id) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    
    if (name) user.name = name;
    if (password) user.password = password; // aqui hash depois

    await user.save();

    res.json({ message: "Usuário atualizado com sucesso" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Erro interno" });
  }
},


  remove(req, res) {
    User.remove(req.params.id, function(err) {
      if (err) return res.status(500).json({ error: "Erro ao deletar" });
      return res.json({ message: "Removido com sucesso" });
    });
  }

};

