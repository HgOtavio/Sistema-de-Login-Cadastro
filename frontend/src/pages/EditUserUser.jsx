import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { decodeId } from "../utils/cryptoId";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/EditUserUser.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function EditUserUser() {
  const { id: encryptedId } = useParams();
  const realId = decodeId(encryptedId);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  //  Verificação de Token / Permissão / ID
  useEffect(() => {
    if (!realId) {
      toast.error("ID inválido ou adulterado!");
      return navigate("/dashboard-user");
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return navigate("/");
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.role !== "admin" && payload.id !== parseInt(realId)) {
        toast.error("Você não pode editar outro usuário!");
        return navigate("/dashboard-user");
      }
    } catch {
      toast.error("Token inválido.");
      return navigate("/");
    }
  }, [realId, navigate]);

  // Carrega dados do usuário
  async function loadUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token ausente. Faça login novamente.");
        return navigate("/");
      }

      const res = await fetch(`http://localhost:3001/users/${realId}`, {
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
      if (user.password !== confirmPassword) {
        toast.error("As senhas não coincidem!");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token ausente. Faça login novamente.");
        return navigate("/");
      }

      const res = await fetch(`http://localhost:3001/users/${realId}`, {
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
              className="user-input"
              disabled
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
