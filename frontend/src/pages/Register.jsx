import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/register.css";
import useRegister from "../hooks/useRegister";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";
import { validarEmail, validarSenha } from "../utils/validation";

export default function Register() {
  const [name, setName] = useState("");
const { registerUser, loading } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();

  //  Validação do email
  if (!validarEmail(email)) {
    toast.error("Email inválido! Exemplo válido: usuario@gmail.com");
    return;
  }

  //  Validação da senha (recebe senha, nome e email)
  if (!validarSenha(password, name, email)) {
    return;
  }

  //  Verifica se as senhas conferem
  if (password !== confirmPassword) {
    toast.error("As senhas não conferem!");
    return;
  }

  //  Chamada ao hook useRegister
  const result = await registerUser({ name, email, password });

  // = Se deu erro
  if (!result.success) {
    toast.error("Erro ao registrar: " + result.error);
    return;
  }

  //  Sucesso
  toast.success("Registrado com sucesso!");

  // Redireciona após 1 segundo
  setTimeout(() => {
    window.location.href = "/";
  }, 1000);

  return result.data;
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
