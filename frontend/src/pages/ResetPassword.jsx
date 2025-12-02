import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../assets/css/reset.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || "");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    // Valida senhas iguais
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem", { autoClose: 3000 });
      return;
    }

    // Aviso de envio
    toast.info("Atualizando senha...", { autoClose: 2000 });

    // Logs para debug
    console.log("=== Reset de senha iniciado ===");
    console.log("Email:", email);
    console.log("Token:", token);
    console.log("Senha pura enviada:", password);
    console.log("Confirmação da senha:", confirmPassword);

    try {
      // Envia a senha pura, sem hash
      const res = await axios.put("/auth/reset", {
        email,
        token,
        password
      });

      console.log("Resposta do backend:", res.data);

      toast.success(res.data.message || "Senha alterada com sucesso!", { autoClose: 3000 });
      navigate("/"); // volta para login
    } catch (error) {
      console.error("Erro no frontend:", error);

      const backendMsg = error?.response?.data?.message;
      const smtpMsg = error?.response?.data?.error;
      const defaultMsg = error?.message;

      toast.error(
        backendMsg || smtpMsg || defaultMsg || "Erro ao redefinir senha",
        { autoClose: 4000 }
      );
    }
  }

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2 className="reset-title">Redefinir senha</h2>
        <form className="reset-form" onSubmit={handleSubmit}>
          <div className="reset-row">
            <input
              className="reset-input"
              type="email"
              placeholder="Email usado na conta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="reset-input"
              type="text"
              placeholder="Token recebido"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="reset-row" style={{ position: "relative" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                className="reset-input"
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={showPassword ? EyeOpen : EyeClosed}
                alt="Mostrar senha"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div style={{ position: "relative", flex: 1 }}>
              <input
                className="reset-input"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirme a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <img
                src={showConfirm ? EyeOpen : EyeClosed}
                alt="Mostrar senha"
                className="eye-icon"
                onClick={() => setShowConfirm(!showConfirm)}
              />
            </div>
          </div>

          <button className="reset-btn" type="submit">Salvar nova senha</button>
        </form>
      </div>
    </div>
  );
}
