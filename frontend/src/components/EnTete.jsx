import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import Logo from "./Logo.jsx";
import "./EnTete.css";

export default function EnTete() {
  return (
    <header className="en-tete">
      <Link to="/" className="en-tete-logo" aria-label="Accueil Laafi Rose">
        <Logo />
      </Link>
      <Link to="/profil" className="en-tete-profil" aria-label="Profil et préférences">
        <UserRound size={20} />
      </Link>
    </header>
  );
}
