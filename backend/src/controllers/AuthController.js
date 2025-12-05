// Importa o model e o repositório
const User = require("../models/UserModel");
const UserRepository = require("../database/UserRepository");
const { sendResetEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyCaptcha } = require("../utils/captcha");
const SECRET = process.env.JWT_SECRET;
const { validarEmail, validarSenha } = require("../utils/validators");


module.exports = {

register(req, res) {
  try {
    // Body precisa existir
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error:
          "É necessário enviar os dados no corpo da requisição como JSON, usando chaves {}"
      });
    }

    let { name, email, password, role } = req.body;

    // Campos obrigatórios
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios" });
    }

    // Normalizar email
    email = email.trim().toLowerCase();

    // Validação de email
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Validação de senha
    if (!validarSenha(password)) {
      return res.status(400).json({
        error:
          "Senha inválida: mínimo 12 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial."
      });
    }

    // Verifica se email já existe
    UserRepository.getByEmail(email, (err, userExist) => {
      if (err) {
        console.error("Erro SQL:", err);
        return res
          .status(500)
          .json({ error: "Erro no servidor ao consultar email" });
      }

      if (userExist) {
        return res.status(400).json({ error: "Email já existe" });
      }

      // Hash da senha
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

      // Criar usuário
      UserRepository.create(user, (err) => {
        if (err) {
          console.error("Erro ao criar usuário:", err);
          return res.status(500).json({
            error: "Erro ao criar usuário"
          });
        }

        return res.json({ message: "Usuário criado com sucesso" });
      });
    });
  } catch (error) {
    console.error("ERRO CRÍTICO NO REGISTER:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
},


// Função de login: valida credenciais e gera token JWT com cargo e ID
  // Função de login: valida credenciais e gera token JWT com cargo e ID
login(req, res) {
  const { email, password } = req.body;

  UserRepository.getByEmail(email, (err, userDb) => {
    if (!userDb) return res.status(400).json({ error: "Usuário não encontrado" });

    const isValid = bcrypt.compareSync(password, userDb.password);
    if (!isValid) return res.status(401).json({ error: "Senha incorreta" });

    // ENVIANDO TAMBÉM name + email NO TOKEN
    const payload = {
      id: userDb.id,
      role: userDb.role,
      name: userDb.name,
      email: userDb.email
    };

    const encrypted = jwt.sign(payload, SECRET, { expiresIn: "1d" });

    return res.json({
      data: encrypted
    });
  });
},


forgotPassword(req, res) {
  try {
    const { email, captchaToken } = req.body;

    // validação básica
    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!captchaToken) {
      return res.status(400).json({ error: "Captcha obrigatório" });
    }

    // valida captcha
    verifyCaptcha(captchaToken, req.ip)
      .then(captchaRes => {
        if (!captchaRes.success) {
          return res.status(400).json({
            error: "Falha na verificação — marque 'Não sou robô'"
          });
        }

        // busca usuário
        UserRepository.getByEmail(email, (err, user) => {
          if (err) {
            console.error("Erro ao buscar usuário:", err);
            return res.status(500).json({ error: "Erro no servidor" });
          }

          // resposta padrão (não revelar se existe ou não)
          if (!user) {
            return res.json({
              message: "Se o email existir, enviaremos o código."
            });
          }

          // verifica se já existe token válido
          UserRepository.checkExistingValidToken(email, (err, exists) => {
            if (err) {
              console.error("Erro ao verificar token existente:", err);
              return res.status(500).json({ error: "Erro no servidor" });
            }

            if (exists) {
              return res.json({
                message:
                  "Um código já foi enviado recentemente. Verifique seu email."
              });
            }

            // gera token de 6 dígitos
            const token = Math.floor(100000 + Math.random() * 900000).toString();

            // salva token
            UserRepository.saveResetToken(email, token, (err) => {
              if (err) {
                console.error("Erro ao salvar token:", err);
                return res.status(500).json({ error: "Erro ao salvar token" });
              }

              // envia email
              sendResetEmail(email, token)
                .then(() => {
                  return res.json({
                    message: "Se o email existir, enviaremos o código."
                  });
                })
                .catch(emailError => {
                  console.error("Erro ao enviar email:", emailError);
                  return res.status(500).json({ error: "Erro ao enviar email" });
                });
            });
          });
        });
      })
      .catch(err => {
        console.error("Erro ao validar captcha:", err);
        return res.status(500).json({ error: "Falha na verificação do captcha" });
      });

  } catch (error) {
    console.error("Erro crítico no forgotPassword:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
},


resetPassword(req, res) {
  try {
    let { email, token, password } = req.body;

    // validação básica
    if (!email || !token || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    email = email.trim().toLowerCase();

    // valida email
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // valida senha usando utils
    const senhaValida = validarSenha(password);
    if (!senhaValida.ok) {
      return res.status(400).json({ error: senhaValida.message });
    }

    // valida token no banco
    UserRepository.validateResetToken(email, token, (err, valid) => {
      if (err) {
        console.error("Erro ao validar token:", err);
        return res.status(500).json({ error: "Erro interno ao processar token" });
      }

      if (!valid) {
        return res.status(400).json({ error: "Token inválido ou expirado" });
      }

      // busca usuário
      UserRepository.getByEmail(email, (err, userDb) => {
        if (err) {
          console.error("Erro ao buscar usuário:", err);
          return res.status(500).json({ error: "Erro ao buscar usuário" });
        }

        if (!userDb) {
          return res.status(404).json({ error: "Usuário não encontrado" });
        }

        // hash da senha
        const hashedPassword = bcrypt.hashSync(password, 10);

        // atualiza senha
        UserRepository.updateUserPassword(userDb.id, hashedPassword, (err) => {
          if (err) {
            console.error("Erro ao atualizar senha:", err);
            return res.status(500).json({ error: "Erro ao atualizar senha" });
          }

          return res.json({ message: "Senha alterada com sucesso!" });
        });
      });
    });

  } catch (error) {
    console.error("Erro crítico no resetPassword:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}



};
