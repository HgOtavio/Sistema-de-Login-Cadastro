// Importa o model, bcrypt para senhas e jwt para autenticação
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = "minha-chave-secreta";

module.exports = {

  // Função de cadastro: cria usuário se o email não estiver cadastrado
  register(req, res) {
    const { name, email, password, role } = req.body;

    User.getByEmail(email, (err, userExist) => {
      if (userExist) return res.status(400).json({ error: "Email já existe" });

      const hash = bcrypt.hashSync(password, 10);
      const now = new Date().toISOString();

      User.create(
        { name, email, password: hash, role: role || "user", created_at: now, updated_at: now },
        function(err) {
          if (err) return res.status(500).json({ error: "Erro ao criar usuário" });
          return res.json({ message: "Usuário criado" });
        }
      );
    });
  },

  // Função de login: valida credenciais e gera token JWT com cargo e ID
  login(req, res) {
    const { email, password } = req.body;

    User.getByEmail(email, (err, user) => {
      if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ token, user });
    });
  }
};
