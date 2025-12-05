import { toast } from "react-toastify";

// Valida email (agora força somente Gmail, se quiser alterar é só mudar o regex)
export function validarEmail(email) {
  const regex = /^[^\s@]+@gmail\.com$/; // só permite @gmail.com
  return regex.test(email.toLowerCase());
}

// Valida senha
export function validarSenha(password, name, email) {
  const nomeLower = name?.toLowerCase() || "";
  const emailLower = email?.toLowerCase() || "";
  const emailUser = emailLower.split("@")[0];
  const senhaLower = password.toLowerCase();

  if (password.length < 12) {
    toast.warning("Senha fraca — mínimo 12 caracteres!");
    return false;
  }

  if (!/[A-Z]/.test(password)) {
    toast.warning("Senha precisa ter pelo menos 1 letra maiúscula!");
    return false;
  }

  if (!/[a-z]/.test(password)) {
    toast.warning("Senha precisa ter pelo menos 1 letra minúscula!");
    return false;
  }

  if (!/[0-9]/.test(password)) {
    toast.warning("Senha precisa ter pelo menos 1 número!");
    return false;
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    toast.warning("Senha precisa ter pelo menos 1 caractere especial!");
    return false;
  }

  if (nomeLower.length >= 3 && senhaLower.includes(nomeLower)) {
    toast.warning("A senha não pode conter parte do nome!");
    return false;
  }

  if (emailUser.length >= 3 && senhaLower.includes(emailUser)) {
    toast.warning("A senha não pode conter parte do email!");
    return false;
  }

  return true;
}

// Verifica se o usuário pode trocar a senha
export function podeTrocarSenha(user, PASSWORD_LIMIT_DAYS = 90) {
  if (!user?.last_password_change) return true;

  const ultima = new Date(user.last_password_change);
  const agora = new Date();
  const diffTime = agora - ultima;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= PASSWORD_LIMIT_DAYS;
}
