import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../assets/css/dashboard-user.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function DashboardUser() {
  const { user, loadingUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Validação do token e redirecionamento
useEffect(() => {
  const token = localStorage.getItem("token");
  console.log("useEffect DashboardUser rodando");
  console.log("Token do localStorage:", token);
  console.log("User do context:", user);
  console.log("loadingUser:", loadingUser);

  if (loadingUser) return; // ainda carregando user

  if (!token || !user) {
    console.log(" Token ou user inválido. Fazendo logout.");
    logout(); // garante que token/user sejam removidos
    toast.error("Você precisa estar logado.");
    navigate("/", { replace: true });
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("Payload do token:", payload);

    if (!payload || payload.id !== user.id) {
      console.log(" Token não corresponde ao user.");
      logout();
      toast.error("Token inválido para este usuário.");
      navigate("/", { replace: true });
      return;
    }

    if (payload.role === "admin") {
      console.log(" Admin tentando acessar painel user.");
      toast.info("Admins acessam o painel administrativo.");
      navigate("/dashboard-admin", { replace: true });
      return;
    }

  } catch (err) {
    console.log(" Erro ao validar token:", err);
    logout();
    toast.error("Token corrompido ou inválido.");
    navigate("/", { replace: true });
    return;
  }
}, [user, loadingUser, logout, navigate]);


  // Adiciona classe ao body
  useEffect(() => {
    document.body.classList.add("dashboard-user");
    return () => document.body.classList.remove("dashboard-user");
  }, []);

  // Valida a senha antes de exclusão
  function validarSenhaParaExclusao() {
    const senha = senhaConfirmacao.toLowerCase();
    const nome = user.name.toLowerCase();
    const email = user.email.toLowerCase();
    const emailUser = email.split("@")[0];

    if (senhaConfirmacao.length < 12) {
      alert("Senha fraca — mínimo 12 caracteres!");
      return false;
    }
    if (!/[A-Z]/.test(senhaConfirmacao)) {
      alert("A senha precisa ter pelo menos 1 letra maiúscula!");
      return false;
    }
    if (!/[a-z]/.test(senhaConfirmacao)) {
      alert("A senha precisa ter pelo menos 1 letra minúscula!");
      return false;
    }
    if (!/[0-9]/.test(senhaConfirmacao)) {
      alert("A senha precisa ter pelo menos 1 número!");
      return false;
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':\"\\|,.<>/?]/.test(senhaConfirmacao)) {
      alert("A senha precisa ter pelo menos 1 caractere especial!");
      return false;
    }
    if (nome.length >= 3 && senha.includes(nome)) {
      alert("A senha não pode conter seu nome!");
      return false;
    }
    if (emailUser.length >= 3 && senha.includes(emailUser)) {
      alert("A senha não pode conter parte do seu email!");
      return false;
    }

    return true;
  }

  // Exclusão da conta
  async function excluirConta() {
    if (!senhaConfirmacao) {
      alert("Informe sua senha para confirmar.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(user.email)) {
      alert("Email inválido! Use um email válido com domínio (ex: .com)");
      return;
    }

    if (!validarSenhaParaExclusao()) return;

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
    navigate("/", { replace: true });
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
            navigate("/", { replace: true });
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
