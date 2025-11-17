import { useState } from "react";
import api from "../services/api";
import "../assets/css/register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password
      });

      alert("Registrado com sucesso!");
      window.location.href = "/";
      return response.data;
    } catch (error) {
      if (error.response) console.log(error.response.data);
      else console.log(error);
      alert("Erro ao registrar. Verifique os dados.");
    }
  }

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Cadastro</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Nome"
            className="register-input"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="register-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="register-input"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="register-button">
            Cadastrar
          </button>
        </form>

        <a href="/" className="register-link">Já tenho conta</a>
      </div>
    </div>
  );
}
