import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../assets/css/forgot.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    toast.info("Enviando email...", { autoClose: 2000 });

    try {
      const res = await axios.post("/auth/forgot", { email });

      toast.success(res.data?.message || "Código enviado com sucesso!", { autoClose: 3000 });

      // Redireciona para reset-password
      navigate("/reset-password", { state: { email } });

    } catch (error) {
      console.error("Erro no frontend:", error);

      const backendMsg = error?.response?.data?.message;
      const smtpMsg = error?.response?.data?.error;
      const defaultMsg = error?.message;

      toast.error(
        backendMsg || smtpMsg || defaultMsg || "Erro desconhecido",
        { autoClose: 4000 }
      );
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <Link to="/">
          <button className="auth-back-arrow">←</button>
        </Link>

        <h2 className="auth-title">Recuperar senha</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Digite seu email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="auth-button" type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
