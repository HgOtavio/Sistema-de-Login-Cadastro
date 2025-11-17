import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";




export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/edit-user/:id" element={<EditUser />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
