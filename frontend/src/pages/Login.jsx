import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/login.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function Login() {
  const { login } = useContext(AuthContext);
  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

async function handleSubmit(e) {
  e.preventDefault();
  setErrorMessage("");

  try {
    const response = await login(email, password);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("Resposta do login:", response);
    console.log("Token no localStorage:", token);
    console.log("Usuário no localStorage:", user);

      window.location.href = "/dashboard";
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      const msg = err.response.data.error;
      if (msg === "Usuário não encontrado") {
        setErrorMessage("Email não cadastrado");
      } else if (msg === "Senha incorreta") {
        setErrorMessage("Senha incorreta");
      } else {
        setErrorMessage("Erro ao realizar login");
      }
    } else {
      setErrorMessage("Erro de conexão");
    }
  }
}


  return (
    <div className="login-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className="password-contai">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <img
              src={showPassword ? EyeOpen : EyeClosed}
              className="passord-icon"
              alt="Mostrar senha"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button type="submit">Entrar</button>
        </form>

        <a href="/register">Criar conta</a>
        <a href="/forgot-password">Esqueci minha senha</a>

      </div>
    </div>
  );
}
