import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/add-user.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useAddUser from "../hooks/useAddUser";
import { validarEmail, validarSenha } from "../utils/validation";



import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";

export default function AddUser() {
const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();
const { addUser, loading } = useAddUser();

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



async function handleCreate(e) {
  e.preventDefault();

  // 🔍 Validação de email
  if (!validarEmail(email)) {
    toast.error("Email inválido! Exemplo válido: usuario@gmail.com");
    return;
  }

  // Validação de senha (recebe senha, nome e email)
  if (!validarSenha(password, name, email)) {
    return;
  }

  //  Senhas diferentes
  if (password !== confirmPassword) {
    toast.error("As senhas não conferem!");
    return;
  }

  //  Chamada ao hook corretamente
  const result = await addUser({
    name,
    email,
    password,
    role,
  });

  //  Falhou
  if (!result.success) {
    toast.error("Erro ao criar usuário: " + result.error);
    return;
  }

  // ✔ Sucesso
  toast.success("Usuário criado com sucesso!");
  navigate("/gerenciar-usuarios");

  return result.data;
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
