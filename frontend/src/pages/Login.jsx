import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/login.css";
import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login(email, password);
      window.location.href = "/dashboard";
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error || "Erro ao fazer login.");
      } else {
        setErrorMessage("Erro inesperado. Tente novamente.");
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
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <img
              src={showPassword ? EyeOpen : EyeClosed}
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
              alt="eye"
            />
          </div>

          <button type="submit">Entrar</button>
        </form>

        <a href="/register">Criar conta</a>
      </div>
    </div>
  );
}
