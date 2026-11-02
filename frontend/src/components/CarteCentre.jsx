import { Link } from "react-router-dom";
import "./CarteCentre.css";

export default function CarteCentre({ centre }) {
  return (
    <article className="carte carte-centre">
      <Link to={`/centres/${centre.id}`} className="carte-centre-nom">
        {centre.nom}
      </Link>
      <p className="carte-centre-type">
        {centre.type} · {centre.ville}
      </p>
    </article>
  );
}
