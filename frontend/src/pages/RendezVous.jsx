import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Hourglass, Phone, MessageSquare, WifiOff } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { obtenirCentre } from "../api/centres.js";
import { demanderRendezVous } from "../api/rendezVous.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useEnLigne } from "../hooks/useEnLigne.js";
import { formaterDate, prenomCourt } from "../utils/texte.js";
import "./RendezVous.css";

function dateDans(jours) {
  const d = new Date();
  d.setDate(d.getDate() + jours);
  return d.toISOString().slice(0, 10);
}

export default function RendezVous() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const enLigne = useEnLigne();

  const [centre, setCentre] = useState(null);
  const [erreurCentre, setErreurCentre] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [nom, setNom] = useState(() => prenomCourt(user));
  const [telephone, setTelephone] = useState(() => (user?.phone || "").replace(/^\+226/, ""));
  const [contact, setContact] = useState("appel");
  const [accord, setAccord] = useState(false);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const [demande, setDemande] = useState(null);

  useEffect(() => {
    let actif = true;
    obtenirCentre(id).then(
      (c) => actif && setCentre(c),
      (e) => actif && setErreurCentre(e.message),
    );
    return () => {
      actif = false;
    };
  }, [id]);

  function verifier() {
    const trouvees = {};
    if (!nom.trim()) trouvees.nom = "Indiquez un nom pour que le centre vous reconnaisse.";
    if (!/^\d{8}$/.test(telephone.replace(/\s+/g, ""))) trouvees.telephone = "Le numéro doit contenir 8 chiffres.";
    if (!accord) trouvees.accord = "Cochez la case pour que le centre puisse vous recontacter.";
    setErreurs(trouvees);
    return !Object.keys(trouvees).length;
  }

  async function envoyer(e) {
    e.preventDefault();
    if (!verifier()) return;
    setEnvoi(true);
    setErreurEnvoi("");
    try {
      const resultat = await demanderRendezVous({
        centreId: id,
        serviceId: service ? Number(service) : null,
        date,
        nom,
        telephone,
        contact,
        langue: preferences.langueAudio,
      });
      setDemande(resultat);
    } catch (err) {
      setErreurEnvoi(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  if (erreurCentre) {
    return (
      <div className="page page-etroite">
        <MessageErreur message={erreurCentre} />
      </div>
    );
  }

  if (!centre) {
    return (
      <div className="page page-etroite">
        <div className="squelette rdv-squelette" />
      </div>
    );
  }

  if (demande) {
    return (
      <div className="page page-etroite rdv-confirmation">
        <span className="rdv-sablier">
          <Hourglass size={34} />
        </span>
        <h1 className="page-titre">Demande envoyée</h1>
        <p className="page-sous-titre">
          Elle est en attente de confirmation. {centre.name} vous contactera par {contact === "sms" ? "SMS" : "appel"} au {demande.phone}.
        </p>
        <div className="carte rdv-reference">
          <span className="surtitre">Référence à conserver</span>
          <strong>{demande.reference}</strong>
          {demande.desired_at && <span className="texte-doux">Jour souhaité : {formaterDate(demande.desired_at)}</span>}
        </div>
        <div className="rdv-fin">
          <Link to="/" className="btn-principal">
            Retour à l'accueil
          </Link>
          <Link to={`/centres/${centre.id}`} className="btn-secondaire">
            Voir le centre
          </Link>
        </div>
      </div>
    );
  }

  const services = (centre.services || []).filter((s) => s.available);

  return (
    <div className="page page-etroite rdv">
      <button type="button" className="btn-texte" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Retour
      </button>
      <p className="surtitre">Demande de rendez-vous</p>
      <h1 className="page-titre">{centre.name}</h1>
      <p className="page-sous-titre">Aucune information médicale ne vous sera demandée.</p>

      <form className="rdv-formulaire" onSubmit={envoyer} noValidate>
        <fieldset>
          <legend>1. Motif</legend>
          <div className="pile">
            {services.map((s) => (
              <label key={s.id} className={String(s.id) === service ? "rdv-option actif" : "rdv-option"}>
                <input type="radio" name="service" value={s.id} checked={String(s.id) === service} onChange={(e) => setService(e.target.value)} />
                <span>
                  <strong>{s.name}</strong>
                  {s.is_free && <span className="badge badge-vert">Gratuit</span>}
                </span>
              </label>
            ))}
            <label className={!service ? "rdv-option actif" : "rdv-option"}>
              <input type="radio" name="service" value="" checked={!service} onChange={() => setService("")} />
              <span>
                <strong>Je ne sais pas encore</strong>
                <span className="texte-doux">Le centre vous orientera</span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Jour souhaité</legend>
          <label className="champ">
            Date (facultatif)
            <input type="date" value={date} min={dateDans(1)} max={dateDans(60)} onChange={(e) => setDate(e.target.value)} />
            <span className="champ-aide">Le jour reste à confirmer par le centre.</span>
          </label>
        </fieldset>

        <fieldset>
          <legend>3. Vos coordonnées</legend>
          <div className="pile">
            <label className="champ">
              Nom ou prénom
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="given-name" />
              {erreurs.nom && <span className="champ-erreur">{erreurs.nom}</span>}
            </label>
            <label className="champ">
              Numéro de téléphone
              <span className="champ-prefixe">
                <span>+226</span>
                <input type="tel" inputMode="numeric" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="70 12 34 56" autoComplete="tel-national" />
              </span>
              {erreurs.telephone ? <span className="champ-erreur">{erreurs.telephone}</span> : <span className="champ-aide">8 chiffres</span>}
            </label>
            <div className="champ">
              Être contacté(e) par
              <div className="segments">
                <button type="button" className={contact === "appel" ? "actif" : ""} aria-pressed={contact === "appel"} onClick={() => setContact("appel")}>
                  <Phone size={16} /> Appel
                </button>
                <button type="button" className={contact === "sms" ? "actif" : ""} aria-pressed={contact === "sms"} onClick={() => setContact("sms")}>
                  <MessageSquare size={16} /> SMS
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <label className="case">
          <input type="checkbox" checked={accord} onChange={(e) => setAccord(e.target.checked)} />
          <span>J'accepte que ce centre utilise mon numéro pour me recontacter au sujet de cette demande.</span>
        </label>
        {erreurs.accord && <p className="champ-erreur">{erreurs.accord}</p>}

        {erreurEnvoi && <Encadre ton="rouge">{erreurEnvoi}</Encadre>}
        {!enLigne && (
          <Encadre Icone={WifiOff} ton="sable">
            Vous êtes hors connexion. Vous pourrez envoyer la demande dès que le réseau revient, ou appeler directement le centre.
          </Encadre>
        )}

        <button type="submit" className="btn-principal btn-large" disabled={envoi || !enLigne}>
          {envoi ? "Envoi…" : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}
