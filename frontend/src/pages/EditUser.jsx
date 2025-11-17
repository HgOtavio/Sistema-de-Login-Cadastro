import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/css/EditUser.css"; 

export default function EditUser() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  async function loadUser() {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.log("Erro ao carregar usuário:", err);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify(user),
      });

      await res.json();
      alert("Atualizado com sucesso!");
      window.location.href = "/gerenciar-usuarios";
    } catch (err) {
      console.log("Erro ao atualizar usuário:", err);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) return <p>Carregando...</p>;

  return (
    <div className="manage-container">
      <div className="manage-box">
        <h1 className="manage-title">Editar Usuário</h1>

        <form onSubmit={handleUpdate} className="form-add">
          <input
            id="user-name"
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="input-field"
          />

          <input
            id="user-email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="input-field"
          />

          <select
            id="user-role"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
            className="select-field"
          >
            <option value="user">Usuário comum</option>
            <option value="admin">Administrador</option>
          </select>

          <button id="save-button" type="submit" className="edit-btn">
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
