import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/EditUser.css";
import useUpdateUser from "../hooks/useUpdateUser";
import { decodeId } from "../utils/cryptoId";
import { validarEmail, validarSenha, podeTrocarSenha } from "../utils/validation";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser, loading, userData } = useUpdateUser();

  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    last_password_change: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const PASSWORD_LIMIT_DAYS = 30;

  // Carregar usuário
  const loadUser = useCallback(async () => {
    try {
      const realId = decodeId(id);
      if (!realId) {
        toast.error("ID inválido ou corrompido.");
        return;
      }

      const params = new URLSearchParams({ id: realId });
      const res = await fetch(`http://localhost:3001/users/find?${params.toString()}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao carregar usuário.");
        return;
      }

      const userData = data[0]; // pega o primeiro objeto do array
      setUser({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        password: "",
        last_password_change: userData.last_password_change
      });

    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuário.");
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Atualizar usuário usando hook
  async function handleUpdate(e) {
    e.preventDefault();
    await updateUser({
      user,
      confirmPassword,
      id,
      PASSWORD_LIMIT_DAYS,
      navigate
    });
  }

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

        {user.last_password_change && (
          <p style={{color:"#aaa", fontSize:"13px"}}>
            Última troca de senha: {new Date(user.last_password_change).toLocaleDateString("pt-BR")}
          </p>
        )}

        {!podeTrocarSenha() && (
          <p style={{color:"#ff4444", fontSize:"13px"}}>
            Você só poderá trocar a senha após {PASSWORD_LIMIT_DAYS} dias.
          </p>
        )}

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
                disabled={!podeTrocarSenha()}
              />
              <img
                src={showPass1 ? EyeOpen : EyeClosed}
                alt=""
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
                disabled={!podeTrocarSenha()}
              />
              <img
                src={showPass2 ? EyeOpen : EyeClosed}
                alt=""
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
