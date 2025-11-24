import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../assets/css/dashboard-user.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function DashboardUser() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard-user");
    return () => {
      document.body.classList.remove("dashboard-user");
    };
  }, []);

  async function excluirConta() {
    if (!senhaConfirmacao) {
      alert("Informe sua senha para confirmar.");
      return;
    }

    const res = await fetch(`http://localhost:3001/users/${user.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ password: senhaConfirmacao }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Senha incorreta!");
      return;
    }

    alert("Conta excluída com sucesso!");
    logout();
    navigate("/");
  }

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

        <h1 className="dashboard-titlle">
          Olá, {user.name.split(" ").slice(0, 2).join(" ")}
        </h1>

        <button
          className="user-edit-btn"
          onClick={() => navigate(`/editar-meu-perfil/${user.id}`)}
        >
          Editar minhas Informações
        </button>

        <button className="deldelte" onClick={() => setShowModal(true)}>
          Excluir minha conta
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-delete-box">

              <h2>Confirmar Exclusão</h2>

              <div className="senha-container">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senhaConfirmacao}
                  onChange={(e) => setSenhaConfirmacao(e.target.value)}
                  placeholder="Digite sua senha"
                  className="modal-delete-input"
                />

                <img
                  src={mostrarSenha ? EyeOpen : EyeClosed}
                  className="icone-olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  alt="mostrar senha"
                />
              </div>

              <div className="modal-delete-buttons">
                <button className="modal-confirm" onClick={excluirConta}>
                  Confirmar
                </button>

                <button
                  className="modal-cancl"
                  onClick={() => {
                    setSenhaConfirmacao("");
                    setShowModal(false);
                  }}
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        )}

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
