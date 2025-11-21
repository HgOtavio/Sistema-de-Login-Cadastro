import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/EditUser.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  async function loadUser() {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao carregar usuário.");
        return;
      }

      setUser({
        name: data.name,
        email: data.email,
        role: data.role,
        password: "",
      });

    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
      toast.error("Erro ao carregar usuário.");
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    if (user.password !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao atualizar usuário.");
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      navigate("/gerenciar-usuarios");

    } catch (err) {
      console.log("Erro ao atualizar usuário:", err);
      toast.error("Erro ao atualizar usuário.");
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div className="panel-container">
      <div className="panel-box">

        <button
          className="btn-back"
          onClick={() => navigate("/gerenciar-usuarios")}
        >
          ⬅ Voltar
        </button>

        <h1 className="panel-title">Editar Usuário</h1>

        <form onSubmit={handleUpdate} className="panel-form-grid">

          <div className="left-column">
            <label className="input-label">Nome</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="if"
            />

            <label className="input-label">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="if"
            />

            <label className="input-label">Cargo</label>
            <select
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              className="ll"
            >
              <option value="user">Usuário Comum</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="right-column">
            <label className="input-label">Nova Senha</label>
            <div className="input-eye-container">
              <input
                type={showPass1 ? "text" : "password"}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="if"
                placeholder="Digite a nova senha"
              />
              <img
                src={showPass1 ? EyeOpen : EyeClosed}
                className="eye-icon"
                onClick={() => setShowPass1(!showPass1)}
              />
            </div>

            <label className="input-label">Confirmar Senha</label>
            <div className="input-eye-container">
              <input
                type={showPass2 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="if"
                placeholder="Repita a senha"
              />
              <img
                src={showPass2 ? EyeOpen : EyeClosed}
                className="eye-icon"
                onClick={() => setShowPass2(!showPass2)}
              />
            </div>
          </div>
        </form>

        <button
          id="save-btn"
          type="submit"
          onClick={handleUpdate}
          className="save-btn"
        >
          Salvar Alterações
        </button>

      </div>
    </div>
  );
}
