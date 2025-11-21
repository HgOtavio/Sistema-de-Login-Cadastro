import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../assets/css/dashboard-user.css";

export default function DashboardUser() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("dashboard-user");

    return () => {
      document.body.classList.remove("dashboard-user");
    };
  }, []);

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
<h1 className="dashboard-titlle">Olá, {user.name.split(" ").slice(0, 2).join(" ")}</h1>
       

        <button
          className="user-edit-btn"
          onClick={() => navigate(`/editar-meu-perfil/${user.id}`)}
        >
          Editar minhas Informações
        </button>

        <button
          className="dashboard-logot"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
