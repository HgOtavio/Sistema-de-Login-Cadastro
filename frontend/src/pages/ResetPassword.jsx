import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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

  const [timeLeft, setTimeLeft] = useState(0);

  
  useEffect(() => {
    const expireTime = localStorage.getItem("resetExpire");

    if (!expireTime) {
      toast.error("Nenhum token encontrado!", { autoClose: 4000 });
      return navigate("/");
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.floor((expireTime - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        toast.error("Tempo expirado! Solicite outro token.", { autoClose: 5000 });
        localStorage.removeItem("resetExpire");
        navigate("/");
        return;
      }

      setTimeLeft(diff);

    }, 1000);

    return () => clearInterval(timer);

  }, [navigate]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem", { autoClose: 3000 });
      return;
    }

    toast.info("Atualizando senha...", { autoClose: 2000 });

    try {
      const res = await axios.put("/auth/reset", {
        email,
        token,
        password
      });

      toast.success(res.data.message || "Senha alterada com sucesso!", { autoClose: 3000 });

      localStorage.removeItem("resetExpire");
      navigate("/");

    } catch (error) {
      console.error("Erro no frontend:", error);

      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Erro ao redefinir senha",
        { autoClose: 4000 }
      );
    }
  }

  return (
    <div className="reset-container">
      <div className="reset-box">

        {/* Timer visual */}
        <div style={{ textAlign: "center", color: "#66aaff", marginBottom: "10px" }}>
          Token expira em: <b>{formatTime(timeLeft)}</b>
        </div>

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

        {/* link de lembrou senha */}
        <div style={{ marginTop: "15px", color: "#bbbbbb" }}>
          Lembrou a senha? <Link to="/" style={{ color: "#66aaff" }}>Voltar ao login</Link>
        </div>

      </div>
    </div>
  );
}
