import { Link } from "react-router-dom";
import { MapPin, BadgeCheck, CircleHelp, CalendarCheck } from "lucide-react";
import "./CarteCentre.css";

export default function CarteCentre({ centre }) {
  const lieu = [centre.district, centre.city].filter(Boolean).join(", ");

  return (
    <Link to={`/centres/${centre.id}`} className="carte carte-centre">
      <span className="carte-centre-haut">
        <span className="carte-centre-nom">{centre.name}</span>
        {centre.distance_km != null && <span className="carte-centre-distance">{centre.distance_km.toFixed(1).replace(".", ",")} km</span>}
      </span>
      {centre.type && <span className="texte-doux">{centre.type}</span>}
      {lieu && (
        <span className="carte-centre-lieu">
          <MapPin size={16} />
          {lieu}
        </span>
      )}
      <span className="rangee">
        {centre.verified ? (
          <span className="badge badge-vert">
            <BadgeCheck size={14} />
            Infos vérifiées
          </span>
        ) : (
          <span className="badge badge-ambre">
            <CircleHelp size={14} />
            Infos à vérifier
          </span>
        )}
        {centre.accepts_appointments && (
          <span className="badge badge-rose">
            <CalendarCheck size={14} />
            Rendez-vous
          </span>
        )}
      </span>
    </Link>
  );
}
