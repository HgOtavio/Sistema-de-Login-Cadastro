import { useState } from "react";
import api from "../services/api";

export default function useRegister() {
  const [loading, setLoading] = useState(false);

  async function registerUser(data) {
    try {
      setLoading(true);

      const response = await api.post("/auth/register", data);

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao registrar."
      };

    } finally {
      setLoading(false);
    }
  }

  return { registerUser, loading };
}
