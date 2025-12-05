import { useState } from "react";
import api from "../services/api";

export default function useAddUser() {
  const [loading, setLoading] = useState(false);

  async function addUser(data) {
    try {
      setLoading(true);

      const response = await api.post("/auth/register", data);

      return {
        success: true,
        data: response.data,
      };

    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data ||
          "Erro ao criar usuário.",
      };
    } finally {
      setLoading(false);
    }
  }

  return { addUser, loading };
}
