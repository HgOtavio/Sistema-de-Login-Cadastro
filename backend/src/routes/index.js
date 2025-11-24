// Registro central de rotas — agrupa rotas públicas e rotas protegidas
const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

// Rotas relacionadas a autenticação (cadastro/login)
router.use("/auth", authRoutes);

// Rotas relacionadas ao CRUD de usuários
router.use("/users", userRoutes);

module.exports = router;
