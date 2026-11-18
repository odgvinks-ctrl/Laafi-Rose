import { Link } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";
import EtatVide from "./EtatVide.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { roleDe } from "../utils/roles.js";

export default function AccesReserve({ roles, children }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page page-etroite">
        <EtatVide Icone={LogIn} titre="Espace réservé aux professionnels" texte="Connectez-vous avec le compte fourni par l'administrateur de Laafi Rose.">
          <Link to="/connexion" className="btn-principal">
            Se connecter
          </Link>
        </EtatVide>
      </div>
    );
  }

  if (!roles.includes(roleDe(user))) {
    return (
      <div className="page page-etroite">
        <EtatVide Icone={ShieldAlert} titre="Accès non autorisé" texte="Votre compte ne donne pas accès à cet espace.">
          <Link to="/" className="btn-secondaire">
            Retour à l'accueil
          </Link>
        </EtatVide>
      </div>
    );
  }

  return children;
}
