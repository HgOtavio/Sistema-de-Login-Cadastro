// Rotas de usuário — protegidas por autenticação e controle de permissão
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// Middlewares de proteção: auth = exige token, admin = exige role admin
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Lista todos os usuários — permitido apenas para administradores
router.get("/", auth, admin, UserController.list);

// Retorna dados de um usuário específico — permitido para admin ou para o próprio usuário
router.get("/:id", auth, UserController.get);

// Atualiza dados do usuário — permitido para admin ou para o próprio usuário
router.put("/:id", auth, UserController.update);

// Remove um usuário — apenas admin pode deletar usuários
router.delete("/:id", auth, admin, UserController.remove);

module.exports = router;
