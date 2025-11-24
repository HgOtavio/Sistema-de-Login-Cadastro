// Middleware que impede acesso de usuários não logados e restringe páginas exclusivas do administrador
module.exports = function (req, res, next) {

  if (!req.user) {
    return res.status(401).json({ error: "Usuário não autenticado" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }

  next();
};
