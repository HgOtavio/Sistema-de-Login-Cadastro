// Configuração principal do servidor Express — responsável por iniciar a API
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
require("dotenv").config();


const app = express();

// Habilita CORS para permitir acesso de outros domínios (ex: frontend React)
app.use(cors());

// Habilita recebimento de JSON no corpo das requisições
app.use(express.json());

// Registra todas as rotas da aplicação
app.use(routes);

// Mensagem para teste no navegador
app.get("/", (req, res) => {
  res.send("API rodando! Sistema de Login & Cadastro");
});

// Inicia o servidor na porta 3001
app.listen(process.env.PORT, () => {
  console.log("Servidor rodando na porta", process.env.PORT);
});

