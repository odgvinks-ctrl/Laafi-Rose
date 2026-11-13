import { CloudOff, RefreshCw } from "lucide-react";
import EtatVide from "./EtatVide.jsx";

export default function MessageErreur({ message, onReessayer }) {
  return (
    <EtatVide Icone={CloudOff} titre="Impossible d'afficher ce contenu" texte={message}>
      {onReessayer && (
        <button type="button" className="btn-secondaire" onClick={onReessayer}>
          <RefreshCw size={18} />
          Réessayer
        </button>
      )}
    </EtatVide>
  );
}
