import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/dashboard-user.css";
import "../assets/css/dashboard-admin.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  function handleAdminAccess(route) {
    setSelectedRoute(route);
    setShowPasswordModal(true);
  }

  function validatePassword() {
    if (adminPassword === "123admin") {
      window.location.href = selectedRoute;
    } else {
      alert("Senha incorreta!");
    }
  }

  useEffect(() => {
    if (!user) return;

    document.body.classList.remove("dashboard-admin", "dashboard-user");
    document.body.classList.add(
      user.role === "admin" ? "dashboard-admin" : "dashboard-user"
    );

    return () => {
      document.body.classList.remove("dashboard-admin", "dashboard-user");
    };
  }, [user]);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <h2>Carregando...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h1 className="dashboard-title">Bem-vindo, {user.name}</h1>
        <p className="dashboard-role">Tipo de usuário: {user.role}</p>

        {user.role === "admin" && (
          <div className="dashboard-admin-section">
            <h3 className="admin-title">Painel Administrativo</h3>

            <button
              className="admin-btn"
              onClick={() => handleAdminAccess("/gerenciar-usuarios")}
            >
              Gerenciar Usuários
            </button>

            <button
              className="admin-btn"
              onClick={() => handleAdminAccess("/relatorios")}
            >
              Relatórios do Sistema
            </button>

            <button
              className="admin-btn"
              onClick={() => handleAdminAccess("/configuracoes")}
            >
              Configurações Avançadas
            </button>
          </div>
        )}

        <button
          className="dashboard-logout"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
        >
          Sair
        </button>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Digite a senha de administrador</h3>

            <div className="password-container">
              <input
                type={showAdminPassword ? "text" : "password"}
                placeholder="Senha admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                
              />
               <img
                src={showAdminPassword ? EyeOpen : EyeClosed}
                className="password-icon"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                alt="eye"
              />

             
            </div>

            <button onClick={validatePassword}>Entrar</button>
            <button onClick={() => setShowPasswordModal(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
