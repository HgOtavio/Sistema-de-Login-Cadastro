import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Dashboard() {
  const { user, loadingUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // espera o user carregar
    if (loadingUser) return;

    const token = localStorage.getItem("token");

    // não tem token ou user → força logout
    if (!token || !user) {
      logout();
      toast.error("Você precisa estar logado.");
      navigate("/", { replace: true });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // valida id do token com o user
      if (!payload || payload.id !== user.id) {
        logout();
        toast.error("Token inválido ou expirado.");
        navigate("/", { replace: true });
        return;
      }

      // verifica se é admin
      if (payload.role === "admin") {
        toast.success("Bem-vindo administrador!");
        navigate("/dashboard-admin", { replace: true });
        return;
      }

      // user normal
      toast.info("Entrando no painel do usuário.");
      navigate("/dashboard-user", { replace: true });

    } catch (err) {
      logout();
      toast.error("Erro ao validar credenciais.");
      navigate("/", { replace: true });
    }
  }, [user, loadingUser, logout, navigate]);

  return null;
}
