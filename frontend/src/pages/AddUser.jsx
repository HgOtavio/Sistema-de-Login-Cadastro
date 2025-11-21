import { useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      toast.error("As senhas não conferem!");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      toast.success("Usuário criado com sucesso!");
      window.location.href = "/gerenciar-usuarios";
      return response.data;
    } catch (error) {
      if (error.response) {
        const msg =
          error.response.data.error ||
          JSON.stringify(error.response.data) ||
          "Verifique os dados";
        toast.error("Erro ao criar usuário: " + msg);
      } else {
        toast.error("Erro ao criar usuário. Verifique a conexão com o servidor.");
      }
    }
  }

  return (
    <div className="mc">
      <div className="mb ab">

        <a href="/gerenciar-usuarios" className="btn-voltar">
          ⬅ Voltar
        </a>

        <h1 className="mt">Adicionar Novo Usuário</h1>

        <form className="fa" onSubmit={handleCreate}>
          <div className="fg">
            <label className="flb">Nome</label>
            <input
              className="ifl"
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="fg">
            <label className="flb">Email</label>
            <input
              className="ifl"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="fg">
            <label className="flb">Senha</label>
            <div className="pc">
              <input
                className="ifl"
                type={showPassword ? "text" : "password"}
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <img
                src={showPassword ? EyeOpen : EyeClosed}
                className="pi"
                onClick={() => setShowPassword(!showPassword)}
                alt="eye"
              />
            </div>
          </div>

          <div className="fg">
            <label className="flb">Confirmar Senha</label>
            <div className="pc">
              <input
                className="ifl"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <img
                src={showConfirmPassword ? EyeOpen : EyeClosed}
                className="pi"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                alt="eye"
              />
            </div>
          </div>

          <div className="fg ff">
            <label className="flb">Tipo de Usuário</label>
            <select
              className="sf"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Usuário comum</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button type="submit" className="bs ff">
            Salvar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}
