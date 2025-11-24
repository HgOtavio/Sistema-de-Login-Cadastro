// Rotas públicas de autenticação — cadastro e login
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

// Rota de criação de usuário
router.post("/register", AuthController.register);

// Rota de login e retorno de token JWT
router.post("/login", AuthController.login);

module.exports = router;
