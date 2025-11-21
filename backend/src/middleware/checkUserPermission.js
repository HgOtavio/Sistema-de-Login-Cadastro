const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "minha-chave-secreta";

module.exports = function checkUserPermission(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    const userIdFromToken = decoded.id;
    const userIdFromParams = parseInt(req.params.id, 10);

    // Se não for admin e tentar acessar outro usuário, bloqueia
    if (decoded.role !== "admin" && userIdFromToken !== userIdFromParams) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.user = decoded; // guarda dados do token para o controller
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
