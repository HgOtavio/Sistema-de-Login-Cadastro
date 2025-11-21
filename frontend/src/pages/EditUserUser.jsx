import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/EditUserUser.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function EditUserUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Verificação mega-power: logado + ID correto
  useEffect(() => {
    if (!loggedUser) {
      toast.error("Você precisa estar logado.");
      return navigate("/");
    }

    if (loggedUser.role === "user" && parseInt(loggedUser.id) !== parseInt(id)) {
      toast.error("Você não pode editar outro usuário!");
      return navigate("/dashboard-user");
    }
  }, [id, loggedUser, navigate]);

  // Carrega dados do usuário
  async function loadUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token ausente. Faça login novamente.");
        return navigate("/");
      }

      const res = await fetch(`http://localhost:3001/users/${id}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao carregar usuário.");
        return navigate("/dashboard-user");
      }

      setUser({
        name: data.name || "",
        email: data.email || "",
        password: "",
        role: data.role || "user"
      });

    } catch (err) {
      console.error("Erro ao carregar usuário:", err);
      toast.error("Erro ao carregar usuário.");
      navigate("/dashboard-user");
    }
  }


 async function handleUpdate(e) {
  e.preventDefault();

  try {
    const lastUpdate = localStorage.getItem(`lastUpdate_${user.id}`);
    const now = new Date().getTime();

    if (lastUpdate) {
      const diffHours = (now - parseInt(lastUpdate)) / (1000 * 60 * 60);
      if (diffHours < 24) {
        toast.error(`Você só pode atualizar suas informações a cada 24 horas. Tente novamente em ${Math.ceil(24 - diffHours)}h.`);
        return;
      }
    }

    if (user.password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Token ausente. Faça login novamente.");
      return navigate("/");
    }

    const res = await fetch(`http://localhost:3001/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Erro ao atualizar.");
      return;
    }

    localStorage.setItem(`lastUpdate_${user.id}`, now.toString());

    toast.success("Atualizado com sucesso!");
    navigate("/dashboard-user");

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    toast.error("Erro ao atualizar usuário. Tente novamente mais tarde.");
  }
}

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="user-panel-container">
      <div className="user-panel-box">

        <button
          className="user-btn-back"
          onClick={() => navigate("/dashboard-user")}
        >
          ⬅ Voltar
        </button>

        <h1 className="user-panel-title">Editar Seus Dados</h1>

        <form onSubmit={handleUpdate} className="user-panel-form-grid">

          <div className="user-left-column">
            <label className="user-input-label">Nome</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="user-input"
            />

            <label className="user-input-label">Email</label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="user-input"
            />
          </div>

          <div className="user-right-column">
            <label className="user-input-label">Nova Senha</label>
            <div className="user-input-eye-container">
              <input
                type={showPass1 ? "text" : "password"}
                value={user.password}
                onChange={(e) =>
                  setUser({ ...user, password: e.target.value })
                }
                className="user-input"
                placeholder="Digite a nova senha"
              />
              <img
                src={showPass1 ? EyeOpen : EyeClosed}
                className="user-eye-icon"
                onClick={() => setShowPass1(!showPass1)}
              />
            </div>

            <label className="user-input-label">Confirmar Senha</label>
            <div className="user-input-eye-container">
              <input
                type={showPass2 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="user-input"
                placeholder="Repita a senha"
              />
              <img
                src={showPass2 ? EyeOpen : EyeClosed}
                className="user-eye-icon"
                onClick={() => setShowPass2(!showPass2)}
              />
            </div>
          </div>

          <button type="submit" className="user-save-btn">
            Salvar Alterações
          </button>

        </form>
      </div>
    </div>
  );
}
