import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/register.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validarEmail(email) {
    // precisa de algo antes do @ e algo depois contendo um ponto ex: gmail.com
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha() {
    const nome = name.toLowerCase();
    const emailLower = email.toLowerCase();
    const emailUser = emailLower.split("@")[0];
    const senha = password.toLowerCase();

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

    if (nome.length >= 3 && senha.includes(nome)) {
      toast.warning("A senha não pode conter parte do nome!");
      return false;
    }

    if (emailUser.length >= 3 && senha.includes(emailUser)) {
      toast.warning("A senha não pode conter parte do email!");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // validação email aqui
    if (!validarEmail(email)) {
      toast.error("Email inválido! Exemplo válido: usuario@gmail.com");
      return;
    }

    if (!validarSenha()) return;

    if (password !== confirmPassword) {
      toast.error("As senhas não conferem!");
      return;
    }
    

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password
      });

      toast.success("Registrado com sucesso!");
      window.location.href = "/";
      return response.data;

    } catch (error) {
      if (error.response && error.response.data) {
        const msg =
          error.response.data.error ||
          JSON.stringify(error.response.data) ||
          "Erro ao registrar.";
        toast.error("Erro ao registrar: " + msg);
      } else {
        toast.error("Erro inesperado. Tente novamente mais tarde.");
      }

      console.log("Erro no registro:", error);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Cadastro</h2>

        <form onSubmit={handleSubmit} className="reg-grid">

          <input
            type="text"
            placeholder="Nome"
            className="register-input"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="register-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className="register-input"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? EyeOpen : EyeClosed}
              className="password-eye"
              onClick={() => setShowPassword(!showPassword)}
              alt="eye"
            />
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar Senha"
              className="register-input"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <img
              src={showConfirmPassword ? EyeOpen : EyeClosed}
              className="password-eye"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              alt="eye"
            />
          </div>

          <button type="submit" className="register-button full-col">
            Cadastrar
          </button>
        </form>

        <a href="/" className="register-link">Já tenho conta</a>
      </div>
    </div>
  );
}
