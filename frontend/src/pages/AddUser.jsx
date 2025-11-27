import { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/add-user.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function AddUser() {
const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


 useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Você precisa estar logado.");
    setTimeout(() => navigate("/"), 1200);
    return;
  }

if (loadingUser) return;

if (!user) {
  toast.error("Sessão expirada.");
  setTimeout(() => navigate("/"), 1200);
  return;
}



  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // token não é do user correto
    if (payload.id !== user.id) {
      toast.error("Token não corresponde ao usuário.");
      setTimeout(() => navigate("/"), 1200);
      return;
    }

    // se o cara NÃO é admin → dashboard comum
    if (payload.role !== "admin") {
      toast.error("Acesso restrito! Apenas administradores podem acessar.");
      setTimeout(() => navigate("/dashboard-user"), 1200);
      return;
    }

  } catch (err) {
    toast.error("Erro ao validar token.");
    setTimeout(() => navigate("/login"), 1200);
    return;
  }
}, [user, navigate]);

  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function validarSenha() {
    const nome = name.toLowerCase();
    const emailLower = email.toLowerCase();
    const emailUser = emailLower.split("@")[0];
    const senha = password.toLowerCase();

    if (password.length < 12) {
      toast.warning("Senha fraca — mínimo 12 caracteres!");
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      toast.warning("Senha precisa ter pelo menos 1 letra maiúscula!");
      return false;
    }

    if (!/[a-z]/.test(password)) {
      toast.warning("Senha precisa ter pelo menos 1 letra minúscula!");
      return false;
    }

    if (!/[0-9]/.test(password)) {
      toast.warning("Senha precisa ter pelo menos 1 número!");
      return false;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      toast.warning("Senha precisa ter pelo menos 1 caractere especial!");
      return false;
    }

    if (nome.length >= 3 && senha.includes(nome)) {
      toast.warning("A senha não pode conter parte do nome!");
      return false;
    }

    if (emailUser.length >= 3 && senha.includes(emailUser)) {
      toast.warning("A senha não pode conter parte do email!");
      return false;
    }

    return true;
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!validarEmail(email)) {
      toast.error("Email inválido! Exemplo válido: usuario@gmail.com");
      return;
    }

    if (!validarSenha()) return;

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
      navigate("/gerenciar-usuarios");
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
