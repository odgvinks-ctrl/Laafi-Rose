import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, BellRing, Users, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Logo from "../Logo.jsx";
import "./LayoutSoignant.css";

export default function LayoutSoignant() {
  const { user, logout } = useAuth();

  return (
    <div className="espace-soignant">
      <aside className="soignant-menu">
        <Logo />
        <nav>
          <NavLink to="/soignant" end>
            <LayoutDashboard size={18} /> Tableau de bord
          </NavLink>
          <NavLink to="/soignant/alertes">
            <BellRing size={18} /> Alertes
          </NavLink>
          <NavLink to="/soignant/patients">
            <Users size={18} /> Patients
          </NavLink>
        </nav>
        <div className="soignant-compte">
          <span>{user?.full_name}</span>
          <button type="button" className="btn-texte" onClick={logout}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="soignant-contenu">
        <Outlet />
      </main>
    </div>
  );
}
