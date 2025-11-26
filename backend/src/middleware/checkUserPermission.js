// Middleware que verifica se o usuário tem permissão para acessar/alterar o recurso solicitado
// - Admin pode acessar qualquer ID
// - Usuário comum só pode acessar o próprio ID
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET ;

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

    // Bloqueia acesso caso o usuário não seja admin e tente acessar outro perfil
    if (decoded.role !== "admin" && userIdFromToken !== userIdFromParams) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    req.user = decoded; // usuário autenticado disponível para o próximo middleware/controller
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
