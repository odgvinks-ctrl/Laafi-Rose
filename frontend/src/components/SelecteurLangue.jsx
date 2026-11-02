import { langues } from "../data/langues.js";
import "./SelecteurLangue.css";

export default function SelecteurLangue({ valeur, onChange, disponibles }) {
  return (
    <div className="selecteur-langue" role="radiogroup" aria-label="Langue">
      {langues.map((l) => {
        const dispo = !disponibles || disponibles[l.code];
        return (
          <button
            key={l.code}
            type="button"
            role="radio"
            aria-checked={valeur === l.code}
            className={valeur === l.code ? "langue actif" : "langue"}
            onClick={() => onChange(l.code)}
          >
            {l.nom}
            {!dispo && <span className="langue-prep">en préparation</span>}
          </button>
        );
      })}
    </div>
  );
}
