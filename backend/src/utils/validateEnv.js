function validateEnv() {
  const required = [
    "JWT_SECRET",
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(" Erro: Variáveis de ambiente faltando:");
    missing.forEach((key) => console.error(`- ${key}`));
    process.exit(1); // encerra o servidor
  }

  console.log(" Variáveis de ambiente essenciais carregadas");
}

module.exports = validateEnv;
