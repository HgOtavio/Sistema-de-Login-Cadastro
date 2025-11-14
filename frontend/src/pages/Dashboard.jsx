import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <h2>Carregando...</h2>;
  }

  return (
    <div>
      <h1>Bem-vindo, {user.email}</h1>
      <p>Tipo de usuário: {user.role}</p>

      {user.role === "admin" && (
        <div>
          <h3>Acesso Admin</h3>
          <p>Você pode gerenciar usuários.</p>
        </div>
      )}

      <button onClick={logout}>Sair</button>
    </div>
  );
}
