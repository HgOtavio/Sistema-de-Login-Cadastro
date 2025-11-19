import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/css/EditUserUser.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function EditUserUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: ""       // <-- NECESSÁRIO PARA O PUT NÃO QUEBRAR
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  async function loadUser() {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      setUser({
        name: data.name || "",
        email: data.email || "",
        password: "",
        role: data.role || "user"   // <-- IMPORTANTE
      });

    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    if (user.password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      console.log("Resposta:", data);

      alert("Atualizado com sucesso!");
      navigate("/dashboard-user");

    } catch (err) {
      console.log("Erro ao atualizar usuário:", err);
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
              readOnly        // <-- AGORA FUNCIONA (disabled quebrava tudo)
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
