import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/dashboard-admin");
    } else {
      navigate("/dashboard-user");
    }
  }, [user]);

  return null;
}
