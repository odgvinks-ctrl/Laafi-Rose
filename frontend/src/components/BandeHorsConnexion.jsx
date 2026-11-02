import { WifiOff } from "lucide-react";
import { useEnLigne } from "../hooks/useEnLigne.js";
import "./BandeHorsConnexion.css";

export default function BandeHorsConnexion() {
  const enLigne = useEnLigne();
  if (enLigne) return null;

  return (
    <div className="bande-hors-connexion" role="status">
      <WifiOff size={16} />
      <span>Hors connexion · contenus enregistrés disponibles</span>
    </div>
  );
}
