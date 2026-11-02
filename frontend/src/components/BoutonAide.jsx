import { Phone } from "lucide-react";
import "./BoutonAide.css";

export default function BoutonAide({ onClick, desactive }) {
  return (
    <button type="button" className="bouton-aide" onClick={onClick} disabled={desactive}>
      <Phone size={24} />
      <span className="bouton-aide-titre">J'ai besoin d'aide</span>
      <span className="bouton-aide-sous">Prévient mon médecin et mon centre</span>
    </button>
  );
}
