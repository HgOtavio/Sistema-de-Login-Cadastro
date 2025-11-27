import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL  // fallback
});

// Intercepta TODAS as requisições e injeta o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // pega token do login
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(" Endpoint:", config.url);
  console.log(" Token:", token ? "(enviado)" : "(ausente)");

  return config;
});

export default api;
