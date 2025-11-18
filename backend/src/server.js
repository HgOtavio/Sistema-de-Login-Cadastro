const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

app.use(cors());               
app.use(express.json());
app.use(routes);

app.get("/", (req, res) => {
  res.send("API rodando! Sistema de Login & Cadastro");
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});


