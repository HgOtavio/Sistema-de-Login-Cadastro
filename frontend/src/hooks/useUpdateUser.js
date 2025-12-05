import { useState } from "react";
import { toast } from "react-toastify";
import { validarEmail, validarSenha, podeTrocarSenha } from "../utils/validation";
import { decodeId } from "../utils/cryptoId";

export default function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null); // estado para armazenar usuário carregado

  // 🔹 Carregar usuário pelo ID (rota REST /users/:id)
  async function loadUserById(id) {
    try {
      setLoading(true);

      const realId = decodeId(id); // decodifica se necessário
      if (!realId) {
        toast.error("ID inválido ou corrompido.");
        return null;
      }

      const res = await fetch(`http://localhost:3001/users/${realId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      const data = await res.json();
      if (!res.ok || !data) {
        toast.error("Usuário não encontrado.");
        return null;
      }

      setUserData({
        ...data,
        password: "",
      });

      return data;
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar usuário.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Atualizar usuário (/users/:id)
  async function updateUser({ user, confirmPassword, id, PASSWORD_LIMIT_DAYS = 90, navigate }) {
    try {
      setLoading(true);

      // validação email
      if (!validarEmail(user.email)) {
        toast.error("Email inválido! O email deve conter @ e um domínio válido (ex: .com)");
        return { success: false };
      }

      // validação senha
      if (user.password) {
        if (!podeTrocarSenha(user, PASSWORD_LIMIT_DAYS)) {
          toast.error(`Você só pode trocar a senha após ${PASSWORD_LIMIT_DAYS} dias.`);
          return { success: false };
        }

        if (user.password !== confirmPassword) {
          toast.error("As senhas não coincidem!");
          return { success: false };
        }

        if (!validarSenha(user.password, user.name, user.email)) return { success: false };
      }

      const sendData = {
        name: user.name,
        email: user.email,
        role: user.role,
      };

      if (user.password) sendData.password = user.password;

      const realId = decodeId(id);
      if (!realId) {
        toast.error("ID inválido.");
        return { success: false };
      }

      const res = await fetch(`http://localhost:3001/users/${realId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(sendData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao atualizar usuário.");
        return { success: false };
      }

      toast.success("Usuário atualizado com sucesso!");
      if (navigate) navigate("/gerenciar-usuarios");

      return { success: true, data };
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar usuário.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }

  return { userData, loading, loadUserById, updateUser };
}
