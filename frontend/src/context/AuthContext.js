import { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

      } catch (err) {
        console.error("Erro ao ler dados do localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    }

    setLoadingUser(false);
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });

      const token = response.data.data;
      if (!token) throw new Error("Token inválido recebido do servidor");

      // decodifica payload do JWT
      const decoded = jwtDecode(token);

      if (!decoded.id || !decoded.role) {
        throw new Error("JWT não contém ID ou ROLE");
      }

      // Agora inclui NAME + EMAIL
      const userData = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      };

      // salva no localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      // seta header padrão
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);

      return { success: true, user: userData };

    } catch (error) {
      console.error("Erro no login:", error);

      if (error.response?.data?.error) {
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
