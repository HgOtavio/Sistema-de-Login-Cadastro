const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }

 
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "minha-chave-secreta");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};
