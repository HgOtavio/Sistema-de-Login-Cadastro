import { useEffect, useState } from "react";
import "../assets/css/gerenciar-usuarios.css";

export default function GerenciarUsuarios() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("");

 
  const [showModal, setShowModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  async function carregarUsuarios() {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:3001/users", {
        headers: { Authorization: localStorage.getItem("token") }
      });

      if (!res.ok) throw new Error("Falha ao buscar usuários");

      const data = await res.json();
      setUsers(data);

    } catch (err) {
      console.log("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }

  function abrirModal(id) {
    setUserToDelete(id);
    setShowModal(true);
  }

o
  function fecharModal() {
    setUserToDelete(null);
    setShowModal(false);
  }


  async function confirmarExclusao() {
    try {
      const res = await fetch(`http://localhost:3001/users/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

      if (!res.ok) throw new Error("Erro ao excluir");

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete));

    } catch (err) {
      console.log("Erro ao excluir usuário:", err);
    } finally {
      fecharModal();
    }
  }

  function editarUsuario(id) {
    window.location.href = `/editar-meu-perfil/${id}`;
  }

  function adicionarNovo() {
    window.location.href = "/add-user";
  }

  const usuariosFiltrados = users.filter((u) => {
    const f = filtro.toLowerCase();
    return (
      u.name.toLowerCase().includes(f) ||
      u.email.toLowerCase().includes(f) ||
      String(u.id).includes(f) ||
      u.role.toLowerCase().includes(f)
    );
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div className="manage-container">
      <div className="manage-boxes">

        <button className="back-btn"
          onClick={() => window.location.href = "/dashboard"}>
          ⬅ Voltar ao Dashboard
        </button>

        <h1 className="manage-title">Gerenciar Usuários</h1>

        <input
          type="text"
          className="filter-input"
          placeholder="Filtrar por nome, email, ID ou tipo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <button className="add-btn" onClick={adicionarNovo}>
          + Adicionar Usuário
        </button>

        {loading ? (
          <p>Carregando usuários...</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button className="edit-btna"
                        onClick={() => editarUsuario(u.id)}>
                        Editar
                      </button>

                      <button className="delete-btn"
                        onClick={() => abrirModal(u.id)}>
                        Excluir
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
            <h2>Confirmar Exclusão</h2>
            <p>Tem certeza que deseja excluir este usuário?</p>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={fecharModal}>
                Cancelar
              </button>

              <button className="btn-confirm" onClick={confirmarExclusao}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
