// Importa o model e o repositório
const User = require("../models/UserModel");
const UserRepository = require("../database/UserRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

module.exports = {

  // Função de cadastro: cria usuário se o email não estiver cadastrado
 register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // validação de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    // email precisa ser válido
    if (!email.includes("@") || !email.includes(".")) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // senha mínima
    if (password.length < 4) {
      return res.status(400).json({ error: "A senha deve ter no mínimo 4 caracteres" });
    }

    UserRepository.getByEmail(email, (err, userExist) => {
      if (err) {
        console.error("Erro SQL:", err);
        return res.status(500).json({ error: "Erro no servidor ao consultar email" });
      }
      
      if (userExist) {
        return res.status(400).json({ error: "Email já existe" });
      }

      const hash = bcrypt.hashSync(password, 10);
      const now = new Date().toISOString();

      const user = new User({
        name,
        email,
        password: hash,
        role: role || "user",
        created_at: now,
        updated_at: now
      });

      UserRepository.create(user, (err) => {
        if (err) {
          console.error("Erro ao criar usuário:", err);
          return res.status(500).json({ error: "Erro ao criar usuário" });
        }
        
        return res.json({ message: "Usuário criado com sucesso" });
      });
    });

  } catch (error) {
    console.error(" ERRO CRÍTICO NO REGISTER:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
},

  // Função de login: valida credenciais e gera token JWT com cargo e ID
  login(req, res) {
    const { email, password } = req.body;

    UserRepository.getByEmail(email, (err, userDb) => {
      if (!userDb) return res.status(400).json({ error: "Usuário não encontrado" });

      const isValid = bcrypt.compareSync(password, userDb.password);

      if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

      const token = jwt.sign(
        { id: userDb.id, role: userDb.role },
        SECRET,
        { expiresIn: "1d" }
      );

      delete userDb.password;

      return res.json({ token, user: userDb });
    });
  }
};
