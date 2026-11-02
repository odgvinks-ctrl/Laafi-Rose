import { Link } from "react-router-dom";
import "./CarteFiche.css";

export default function CarteFiche({ fiche }) {
  return (
    <Link to={`/sinformer/${fiche.slug}`} className="carte carte-fiche">
      <span className="carte-fiche-titre">{fiche.titre}</span>
      <span className="carte-fiche-resume">{fiche.resume}</span>
    </Link>
  );
}
