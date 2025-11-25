import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import "../assets/css/dashboard-admin.css";
import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function DashboardAdmin() {
  const { user,loadingUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [route, setRoute] = useState("");
  const [error, setError] = useState("");

  const SENHA_FIXA = "admin123"; 



useEffect(() => {
  const token = localStorage.getItem("token");

  // Enquanto o user está carregando, não faz nada
  if (loadingUser) return;

  // Não tem token → login
  if (!token) {
    toast.error("Você precisa estar logado.");
    setTimeout(() => navigate("/"), 1200);
    return;
  }


  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (!payload || payload.id !== user.id) {
      toast.error("Token inválido ou expirado.");
      setTimeout(() => navigate("/"), 1200);
      return;
    }

    if (payload.role !== "admin") {
      toast.error("Acesso restrito! Apenas administradores podem entrar.");
      setTimeout(() => navigate("/dashboard-user"), 1200);
      return;
    }
  } catch (error) {
    toast.error("Erro ao validar credenciais.");
    setTimeout(() => navigate("/"), 1200);
    return;
  }
}, [user, loadingUser, navigate]);


 


  useEffect(() => {
    document.body.classList.add("dashboard-admin");
    return () => document.body.classList.remove("dashboard-admin");
  }, []);

  function openModal(r) {
    setRoute(r);
    setAdminPass("");
    setError("");
    setShowModal(true);
  }

  function checkPassword() {
    if (!adminPass) return setError("Digite a senha.");

    if (adminPass === SENHA_FIXA) {
      navigate(route);
      setShowModal(false);
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <div className="dashboard-contaiiner">
      <div className="dashboard-boxe">
        <h1 className="dashboard-title">Painel do Administrador</h1>
        <p className="dashboard-role">Admin</p>

        <button className="admin-btn" onClick={() => openModal("/gerenciar-usuarios")}>
          Gerenciar Usuários
        </button>

        <button className="admin-btn" onClick={() => openModal("/relatorios")}>
          Relatórios
        </button>

        <button className="admin-btn" onClick={() => openModal("/configuracoes")}>
          Configurações
        </button>

        <button
          className="dashboard-logout"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sair
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Confirme a senha</h2>

            <div className="passward-container">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Senha admin"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
              />

              <img
                src={showPass ? EyeOpen : EyeClosed}
                className="passward-icon"
                onClick={() => setShowPass(!showPass)}
                alt="eye"
              />
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="modal-buttons">
              <button className="btn-confirm" onClick={checkPassword}>
                Entrar
              </button>

              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
