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
    last_password_change: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const PASSWORD_LIMIT_DAYS = 30;

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
        last_password_change: data.last_password_change
      });

    } catch (err) {
      toast.error("Erro ao carregar usuário.");
    }
  }

  function validarSenha() {

    // se o usuário não está alterando senha, não valida nada
    if (!user.password) return true;

    const nome = user.name.toLowerCase();
    const email = user.email.toLowerCase();
    const emailUser = email.split("@")[0];
    const senha = user.password.toLowerCase();

    if (user.password.length < 12) {
      toast.warning(" Senha fraca — mínimo 12 caracteres!");
      return false;
    }

    if (!/[A-Z]/.test(user.password)) {
      toast.warning(" Senha precisa ter pelo menos 1 letra maiúscula!");
      return false;
    }

    if (!/[a-z]/.test(user.password)) {
      toast.warning(" Senha precisa ter pelo menos 1 letra minúscula!");
      return false;
    }

    if (!/[0-9]/.test(user.password)) {
      toast.warning(" Senha precisa ter pelo menos 1 número!");
      return false;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(user.password)) {
      toast.warning(" Senha precisa ter pelo menos 1 caractere especial!");
      return false;
    }

    if (nome.length >= 3 && senha.includes(nome)) {
      toast.warning(" A senha não pode conter o nome do usuário!");
      return false;
    }

    if (emailUser.length >= 3 && senha.includes(emailUser)) {
      toast.warning(" A senha não pode conter parte do email!");
      return false;
    }

    return true;
  }

  function podeTrocarSenha() {
    if (!user.last_password_change) return true;

    const ultima = new Date(user.last_password_change);
    const agora = new Date();
    const diffTime = agora - ultima;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= PASSWORD_LIMIT_DAYS;
  }

  async function handleUpdate(e) {
    e.preventDefault();

    if (user.password) {

      if (!podeTrocarSenha()) {
        toast.error(`Você só pode trocar a senha após ${PASSWORD_LIMIT_DAYS} dias.`);
        return;
      }

      if (user.password !== confirmPassword) {
        toast.error("As senhas não coincidem!");
        return;
      }

      if (!validarSenha()) return;
    }

    const sendData = {
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.password) {
      sendData.password = user.password;
    }

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(sendData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erro ao atualizar usuário.");
        return;
      }

      toast.success("Usuário atualizado com sucesso!");
      navigate("/gerenciar-usuarios");

    } catch (err) {
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
