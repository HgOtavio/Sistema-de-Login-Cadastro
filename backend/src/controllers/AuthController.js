// Importa o model e o repositório
const User = require("../models/UserModel");
const UserRepository = require("../database/UserRepository");
const { sendResetEmail } = require("../services/emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyCaptcha } = require("../utils/captcha");
const SECRET = process.env.JWT_SECRET;

module.exports = {

  // Função de cadastro: cria usuário se o email não estiver cadastrado
 register(req, res) {
  try {
     if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        error: "É necessário enviar os dados no corpo da requisição como JSON, usando chaves {}" 
      });
    }
    const { name, email, password, role } = req.body;

    // validação de entrada
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    // email precisa ser válido
   const parts = email.split(".");
const lastPart = parts[parts.length - 1];

if (lastPart.length < 2) {
  return res.status(400).json({ error: "Domínio inválido no email" });
}


    // senha mínima

if (password.length < 12) {
  return res.status(400).json({ error: "Senha fraca — mínimo 12 caracteres!" });
}

// pelo menos 1 maiúscula
if (!/[A-Z]/.test(password)) {
  return res.status(400).json({ error: "Senha precisa ter pelo menos 1 letra maiúscula!" });
}

// pelo menos 1 minúscula
if (!/[a-z]/.test(password)) {
  return res.status(400).json({ error: "Senha precisa ter pelo menos 1 letra minúscula!" });
}

// pelo menos 1 número
if (!/[0-9]/.test(password)) {
  return res.status(400).json({ error: "Senha precisa ter pelo menos 1 número!" });
}

// pelo menos 1 símbolo
if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
  return res.status(400).json({ error: "Senha precisa ter pelo menos 1 caractere especial!" });
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
    


    if (!email) return res.status(400).json({ error: "Email é obrigatório" });
    
// VALIDAÇÃO DO FORMATO DO EMAIL
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: "Email inválido" });
}


    if (!captchaToken) return res.status(400).json({ error: "Captcha obrigatório" });

    verifyCaptcha(captchaToken, req.ip)
      .then(captchaRes => {

        if (!captchaRes.success) {
          return res.status(400).json({ error: "Falha na verificação — marque 'Não sou robô'" });
        }

        UserRepository.getByEmail(email, (err, user) => {
          try {
            if (err) {
              console.error(" Erro ao buscar usuário:", err);
              return res.status(500).json({ error: "Erro no servidor" });
            }

            // resposta padrão — segurança
            if (!user) {
              return res.json({ message: "Se o email existir, enviaremos o código." });
            }

            // verifica se já existe token válido
            UserRepository.checkExistingValidToken(email, (err, exists) => {
              if (err) {
                return res.status(500).json({ error: "Erro no servidor" });
              }


              if (exists) {
                return res.json({ 
                  message: "Um código já foi enviado recentemente. Verifique seu email." 
                });
              }

              // gera token de 6 dígitos
              const token = Math.floor(100000 + Math.random() * 900000).toString();
              

              UserRepository.saveResetToken(email, token, (err, result) => {
                if (err) {
                  console.error(" Erro ao salvar token no banco:", err);
                  return res.status(500).json({ error: "Erro ao salvar token" });
                }

           

                sendResetEmail(email, token)
                  .then(() => {
                    return res.json({ message: "Se o email existir, enviaremos o código." });
                  })
                  .catch(emailError => {
                    console.error(" ERRO AO ENVIAR EMAIL:");
                    console.error("MESSAGE:", emailError.message);
                    console.error("STACK:", emailError.stack);
                    console.error("FULL:", emailError);
                    return res.status(500).json({ error: "Erro ao enviar email" });
                  });
              });
            });

          } catch (innerErr) {
            console.error("Erro interno no forgotPassword:", innerErr);
            return res.status(500).json({ error: "Erro interno no servidor" });
          }
        });
      })
      .catch(err => {
        console.error("Erro ao validar captcha:", err);
        return res.status(500).json({ error: "Falha na verificação do captcha" });
      });

  } catch (error) {
    console.error(" Erro crítico no forgotPassword:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
},




resetPassword(req, res) {
  try {
    const { email, token, password } = req.body;

  
    if (!email || !token || !password) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    // regras iguais ao REGISTER
    if (password.length < 12) return res.status(400).json({ error: "Senha fraca — mínimo 12 caracteres!" });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ error: "Senha precisa ter pelo menos 1 letra maiúscula!" });
    if (!/[a-z]/.test(password)) return res.status(400).json({ error: "Senha precisa ter pelo menos 1 letra minúscula!" });
    if (!/[0-9]/.test(password)) return res.status(400).json({ error: "Senha precisa ter pelo menos 1 número!" });
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return res.status(400).json({ error: "Senha precisa ter pelo menos 1 caractere especial!" });

    UserRepository.validateResetToken(email, token, (err, valid) => {
      if (err) return res.status(500).json({ error: "Erro ao processar token" });
      if (!valid) return res.status(400).json({ error: "Token inválido" });

      UserRepository.getByEmail(email, (err, userDb) => {
        if (err || !userDb) return res.status(404).json({ error: "Usuário não encontrado" });

        // HASH CORRETO
        const hashedPassword = bcrypt.hashSync(password, 10);

        UserRepository.updateUserPassword(userDb.id, hashedPassword, (err) => {
          if (err) return res.status(500).json({ error: "Erro ao atualizar senha" });


          return res.json({ message: "Senha alterada com sucesso!" });
        });

      });
    });

  } catch (error) {
    console.error(" ERRO CRÍTICO NO resetPassword:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}




};
