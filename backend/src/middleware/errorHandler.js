module.exports = (err, req, res, next) => {
  console.error(" ERRO NO SERVIDOR:");
  console.error(err);

  const status = err.status || 500;

  return res.status(status).json({
    error: err.message || "Erro interno no servidor",
  });
};
