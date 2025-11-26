import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Login";
import Register from "./pages/Register";




import Dashboard from "./pages/Dashboard";

import GerenciarUsuarios from "./pages/GerenciarUsuarios";
import AddUser from "./pages/AddUser";

import EditUserAdmin from "./pages/EditUserAdmin";
import EditUserUser from "./pages/EditUserUser";

import DashboardUser from "./pages/DashboardUser";
import DashboardAdmin from "./pages/DashboardAdmin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />} />
          <Route path="/add-user" element={<AddUser />} />

          <Route path="/editar-usuario/:id" element={<EditUserAdmin />} />
          <Route path="/editar-meu-perfil/:id" element={<EditUserUser />} />

          <Route path="/dashboard-user" element={<DashboardUser />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
