import { useEffect, useState } from "react";
import "../assets/css/gerenciar-usuarios.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EyeOpen from "../assets/images/eye-open.png";
import EyeClosed from "../assets/images/eye-closed.png";
import { useNavigate } from "react-router-dom";




export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [passwordPrompt, setPasswordPrompt] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();




  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  }

  function openModal(id) {
    setUserToDelete(id);
    setPasswordPrompt("");
    setShowPassword(false);
    setShowModal(true);
  }

  function closeModal() {
    setUserToDelete(null);
    setPasswordPrompt("");
    setShowPassword(false);
    setShowModal(false);
  }

  async function confirmDeletion() {
    try {
      const userObj = users.find((u) => u.id === userToDelete);

      // se o usuário for ele mesmo, verificar a senha
      if (userToDelete === loggedUser.id) {
        if (!passwordPrompt) {
          toast.error("Você precisa entra com asneha para deletar a si memso .");
          return;
        }

        const resVerify = await fetch(
          "http://localhost:3001/auth/verify-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: loggedUser.email,
              password: passwordPrompt,
            }),
          }
        );

        const verifyData = await resVerify.json();
        if (!resVerify.ok || !verifyData.valid) {
          toast.error("Senha incorreta");
          return;
        }
      }

      if (userObj.role === "admin") {
        const totalAdmins = users.filter((u) => u.role === "admin").length;
        if (totalAdmins <= 1) {
          toast.error("Você não pode deletar o ultimo admin!");
          return;
        }
      }

      const res = await fetch(`http://localhost:3001/users/${userToDelete}`, {
        method: "DELETE",
        headers: { Authorization: localStorage.getItem("token") },
      });

      if (!res.ok) throw new Error("Erro ao deletar usuário");

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));
      toast.success("Usuario deletado com sucesso!");

      if (userToDelete === loggedUser.id) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      toast.error("Erro ao deletar usuário");
    } finally {
      closeModal();
    }
  }

  function editUser(id) {
    window.location.href = `/editar-usuario/${id}`;
  }

  function addNewUser() {
    window.location.href = "/add-user";
  }

  const filteredUsers = users.filter((u) => {
    const f = filter.toLowerCase();
    return (
      u.name.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f) ||
      String(u.id).includes(f) ||
      u.role.toLowerCase().includes(f)
    );
  });

useEffect(() => {
  const token = localStorage.getItem("token");
  const userFromStorage = JSON.parse(localStorage.getItem("user"));

  if (!token || !userFromStorage) {
    toast.error("Você precisa estar logado.");
    setTimeout(() => navigate("/"), 1200);
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.id !== userFromStorage.id) {
      toast.error("Token inválido para este usuário.");
      setTimeout(() => navigate("/"), 1200);
      return;
    }

    if (payload.role !== "admin") {
      toast.error("Apenas administradores podem acessar.");
      setTimeout(() => navigate("/dashboard-user"), 1200);
      return;
    }

  
    loadUsers();
  } catch (err) {
    toast.error("Erro ao validar token.");
    setTimeout(() => navigate("/"), 1200);
  }
}, []); 




  return (
    <div className="manage-container">
      <div className="manage-boxes">
        <button
          className="back-btn"
          onClick={() => (window.location.href = "/dashboard")}
        >
          ⬅ Volata para Dashboard
        </button>

        <h1 className="manage-title">Gerenciar Usuario</h1>

        <input
          type="text"
          className="filter-input"
          placeholder="Filtrar usuários por nome, email, id ou função"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <button className="add-btn" onClick={addNewUser}>
          + Adicinar Novo Usuário
        </button>

        {loading ? (
          <p>Carregando usuarios</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5">Sem usaurios</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className="edit-btna"
                        onClick={() => editUser(u.id)}
                      >
                        Editar
                      </button>

                      <button
                        className="delete-btn"
                        style={{
                          backgroundColor:
                            u.id === loggedUser.id ? "gray" : "#ff4d4f",
                       
                        }}
                        onClick={() => openModal(u.id)}
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Confirmar Deleção</h2>
            <p>
              
              {userToDelete === loggedUser.id && " "}
            </p>

            {userToDelete === loggedUser.id && (
              <div className="user-input-eye-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="SENHA DO USUAIRO LOGADO"
                  value={passwordPrompt}
                  onChange={(e) => setPasswordPrompt(e.target.value)}
                  className="user-input"
                />
                <img
                  src={showPassword ? EyeOpen : EyeClosed}
                  className="user-eye-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  alt="eye"
                />
              </div>
            )}

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={closeModal}>
                Cancelar
              </button>

              <button className="btn-confirm" onClick={confirmDeletion}>
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
