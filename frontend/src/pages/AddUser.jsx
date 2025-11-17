import { useState } from "react";
import api from "../services/api";
import "../assets/css/add-user.css";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não conferem!");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      alert("Usuário criado com sucesso!");
      window.location.href = "/gerenciar-usuarios";
      return response.data;
    } catch (error) {
      if (error.response) {
        console.log("Erro ao criar usuário:", error.response.data);
        const msg =
          error.response.data.error ||
          JSON.stringify(error.response.data) ||
          "Verifique os dados";
        alert("Erro ao criar usuário: " + msg);
      } else {
        console.log("Erro ao criar usuário:", error);
        alert("Erro ao criar usuário. Verifique a conexão com o servidor.");
      }
    }
  }

  return (
    <div className="manage-container">
      <div className="manage-box add-box">
        <h1 className="manage-title">Adicionar Novo Usuário</h1>

        <form className="form-add" onSubmit={handleCreate}>

          <label className="form-label">Nome</label>
          <input
            className="input-field"
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="form-label">Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="form-label">Senha</label>
          <div className="password-container">
            <input
              className="input-field"
              type={showPassword ? "text" : "password"}
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? EyeOpen : EyeClosed}
              className="password-icon"
              onClick={() => setShowPassword(!showPassword)}
              alt="eye"
            />
          </div>

          <label className="form-label">Confirmar Senha</label>
          <div className="password-container">
            <input
              className="input-field"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <img
              src={showConfirmPassword ? EyeOpen : EyeClosed}
              className="password-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              alt="eye"
            />
          </div>

          <label className="form-label">Tipo de Usuário</label>
          <select
            className="select-field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Usuário comum</option>
            <option value="admin">Administrador</option>
          </select>

          <button type="submit" className="btn-save">
            Salvar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}
