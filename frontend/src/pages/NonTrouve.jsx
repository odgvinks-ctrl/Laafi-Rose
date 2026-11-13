import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import EtatVide from "../components/EtatVide.jsx";

export default function NonTrouve() {
  return (
    <div className="page page-etroite">
      <EtatVide Icone={Compass} titre="Cette page n'existe pas" texte="Le lien est peut-être incomplet ou la page a été déplacée.">
        <Link to="/" className="btn-principal">
          Retour à l'accueil
        </Link>
      </EtatVide>
    </div>
  );
}
