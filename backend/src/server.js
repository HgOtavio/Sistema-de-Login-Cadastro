
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
require("dotenv").config();

// Validador do .env
const validateEnv = require("../src/utils/validateEnv");

// Middleware global de erros
const errorHandler = require("../src/middleware/errorHandler");

// VALIDA AS VARIÁVEIS DE AMBIENTE ANTES DE INICIAR O SERVIDOR
validateEnv();

const app = express();

// Habilita CORS para permitir acesso externo
app.use(cors());

// Permite receber JSON no body
app.use(express.json());

// Rotas da aplicação
app.use(routes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API rodando! Sistema de Login & Cadastro");
});

// Middleware de erro — precisa ser o último
app.use(errorHandler);

// Inicia o servidor
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});



process.on("uncaughtException", (err) => {
  console.error(" Erro não tratado (uncaughtException):", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Promessa rejeitada sem catch (unhandledRejection):", reason);
});
