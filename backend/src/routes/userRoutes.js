// Rotas de usuário — protegidas por autenticação e controle de permissão
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

// Middlewares de proteção
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Lista todos os usuários — permitido apenas para administradores
router.get("/", auth, admin, UserController.list);

// Buscar usuário por ID — AGORA usando query string (?id=123)
router.get("/find", auth, UserController.get);

// Atualiza dados do usuário — mantém params
router.put("/:id", auth, UserController.update);

// Remove um usuário — mantém params
router.delete("/:id", auth, UserController.remove);

module.exports = router;
