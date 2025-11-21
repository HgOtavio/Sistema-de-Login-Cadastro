import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});


api.interceptors.request.use((config) => {
  console.log(" Enviando requisição para:", config.url);
  console.log(" Token enviado:", config.headers.Authorization);
  return config;
});

export default api;
