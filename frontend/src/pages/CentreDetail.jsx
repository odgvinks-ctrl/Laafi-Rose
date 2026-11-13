import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Navigation, CalendarPlus, MapPin, Clock, BadgeCheck, CircleHelp, CalendarCheck } from "lucide-react";
import MessageErreur from "../components/MessageErreur.jsx";
import { obtenirCentre } from "../api/centres.js";
import { formaterDate } from "../utils/texte.js";
import "./CentreDetail.css";

export default function CentreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [centre, setCentre] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let actif = true;
    obtenirCentre(id).then(
      (c) => {
        if (!actif) return;
        setCentre(c);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [id, essai]);

  if (erreur) {
    return (
      <div className="page page-etroite">
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="page">
        <div className="squelette centre-squelette" />
      </div>
    );
  }

  const adresse = [centre.address, centre.district, centre.city].filter(Boolean).join(", ");
  const itineraire =
    centre.latitude != null && centre.longitude != null
      ? `https://www.google.com/maps/dir/?api=1&destination=${centre.latitude},${centre.longitude}`
      : null;

  return (
    <div className="page centre-detail">
      <button type="button" className="btn-texte" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="centre-grille">
        <section>
          {centre.type && <p className="surtitre">{centre.type}</p>}
          <h1 className="page-titre">{centre.name}</h1>
          <div className="rangee centre-badges">
            {centre.verified ? (
              <span className="badge badge-vert">
                <BadgeCheck size={14} />
                {centre.verified_at ? `Vérifié le ${formaterDate(centre.verified_at)}` : "Infos vérifiées"}
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
                Accepte les rendez-vous
              </span>
            )}
          </div>

          <div className="centre-actions">
            {centre.phone ? (
              <a href={`tel:${centre.phone}`} className="btn-secondaire">
                <Phone size={18} />
                Appeler
              </a>
            ) : (
              <button type="button" className="btn-secondaire" disabled>
                <Phone size={18} />
                Pas de numéro
              </button>
            )}
            {itineraire && (
              <a href={itineraire} target="_blank" rel="noreferrer" className="btn-secondaire">
                <Navigation size={18} />
                Itinéraire
              </a>
            )}
            {centre.accepts_appointments && (
              <Link to={`/centres/${centre.id}/rendez-vous`} className="btn-principal centre-rdv">
                <CalendarPlus size={18} />
                Demander un rendez-vous
              </Link>
            )}
          </div>

          <h2 className="titre-section">Services</h2>
          {centre.services?.length ? (
            <ul className="centre-services">
              {centre.services.map((s) => (
                <li key={s.id} className="carte">
                  <div>
                    <strong>{s.name}</strong>
                    {s.description && <p>{s.description}</p>}
                    {!s.available && <p className="centre-indispo">Momentanément indisponible</p>}
                  </div>
                  {s.is_free && <span className="badge badge-vert">Gratuit</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="texte-doux">Les services de ce centre ne sont pas encore renseignés.</p>
          )}
        </section>

        <aside className="carte centre-infos">
          {adresse && (
            <div className="centre-info">
              <MapPin size={20} />
              <div>
                <span className="texte-doux">Adresse</span>
                <p>{adresse}</p>
              </div>
            </div>
          )}
          {centre.phone && (
            <div className="centre-info">
              <Phone size={20} />
              <div>
                <span className="texte-doux">Téléphone</span>
                <p>{centre.phone}</p>
              </div>
            </div>
          )}
          {centre.opening_hours && (
            <div className="centre-info">
              <Clock size={20} />
              <div>
                <span className="texte-doux">Horaires</span>
                <p>{centre.opening_hours}</p>
              </div>
            </div>
          )}
          <p className="texte-doux centre-maj">Une information n'est plus à jour ? Signalez-le au centre lors de votre visite.</p>
        </aside>
      </div>
    </div>
  );
}
