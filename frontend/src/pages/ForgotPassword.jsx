import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../assets/css/forgot.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // Regex mais completo para validar emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Digite um email válido");
      return;
    }

    if (!captchaToken) {
      toast.error("Por favor confirme que você não é um robô");
      return;
    }

    toast.info("Enviando email...", { autoClose: 2000 });

    try {
      const res = await axios.post("/auth/forgot", { 
        email, 
        captchaToken 
      });

      const expireTime = Date.now() + 10 * 60 * 1000; 
      localStorage.setItem("resetExpire", expireTime);

      toast.success(res.data?.message || "Código enviado com sucesso!", { autoClose: 3000 });
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

          <ReCAPTCHA
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            theme="dark"
            onChange={setCaptchaToken}
          />

          <button className="auth-button" type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
}
