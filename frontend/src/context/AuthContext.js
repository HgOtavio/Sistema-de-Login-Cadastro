import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoadingUser(false);
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, user: userData } = response.data;

      // Salva dados no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // Define token no axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Atualiza estado
      setUser(userData);

      return { success: true, user: userData };

    } catch (error) {

      // CASO API RETORNE ERRO JSON
      if (error.response && error.response.data && error.response.data.error) {
        return { success: false, error: error.response.data.error };
      }

      return { success: false, error: "Erro ao conectar com servidor" };
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    api.defaults.headers.common["Authorization"] = "";
  }

  return (
    <AuthContext.Provider value={{ user, loadingUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
