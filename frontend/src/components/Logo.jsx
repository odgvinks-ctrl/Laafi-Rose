import embleme from "../assets/embleme.png";
import { devise } from "../data/marque.js";
import "./Logo.css";

export default function Logo({ taille = 34, avecDevise = false }) {
  return (
    <span className="logo">
      <img src={embleme} alt="" width={Math.round(taille * 0.875)} height={taille} className="logo-embleme" />
      <span className="logo-texte">
        <span className="logo-nom" style={{ fontSize: taille * 0.62 }}>
          Laafi <em>Rose</em>
        </span>
        {avecDevise && <span className="logo-devise">{devise}</span>}
      </span>
    </span>
  );
}
