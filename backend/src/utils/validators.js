// Validar email
function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar senha forte
function validarSenha(password) {
  if (!password) return false;

  return (
    password.length >= 12 &&                // mínimo 12 caracteres
    /[A-Z]/.test(password) &&               // ao menos 1 maiúscula
    /[a-z]/.test(password) &&               // ao menos 1 minúscula
    /[0-9]/.test(password) &&               // ao menos 1 número
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) // ao menos 1 caractere especial
  );
}

module.exports = {
  validarEmail,
  validarSenha,
};
