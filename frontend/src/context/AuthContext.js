import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // <- flag de carregamento

  // Quando a página recarrega, mantém o usuário logado se houver token no localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoadingUser(false); // <- terminou de carregar o usuário
  }, []);

  // Função que realiza login através da API — salva token e dados do usuário
  async function login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });

      const token = response.data.token;
      const user = response.data.user;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Define o token padrão para as próximas requisições
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Função de logout — limpa autenticação do front
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  }

  // Torna user, login, logout e loadingUser acessíveis a toda a aplicação
  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
