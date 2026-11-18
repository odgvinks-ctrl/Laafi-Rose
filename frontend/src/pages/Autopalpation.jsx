import { useState } from "react";
import { Link } from "react-router-dom";
import { HandHeart, Lock, ArrowLeft, ArrowRight, CircleCheck, TriangleAlert, CalendarPlus, AlarmClock, MapPin, Check } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import { etapesAutopalpation, signesAConsulter } from "../data/autopalpation.js";
import { ajouterRappel, aujourdHui, decaler, lireRappels, marquerFait } from "../utils/rappels.js";
import { ajouterAuCalendrier } from "../utils/calendrier.js";
import { formaterDate } from "../utils/texte.js";
import "./Autopalpation.css";

function rappelAutopalpation() {
  return lireRappels().find((r) => r.type === "autopalpation" && !r.fait) || null;
}

export default function Autopalpation() {
  const [etape, setEtape] = useState(-1);
  const [rappel, setRappel] = useState(rappelAutopalpation);
  const [jour, setJour] = useState(() => decaler(aujourdHui(), "mensuelle"));
  const [heure, setHeure] = useState("09:00");
  const [enregistre, setEnregistre] = useState(false);

  const total = etapesAutopalpation.length;
  const derniere = rappel?.historique?.length ? rappel.historique[rappel.historique.length - 1] : null;

  function terminer() {
    setEtape(total);
    if (rappel && rappel.date <= aujourdHui()) {
      marquerFait(rappel.id);
      setRappel(rappelAutopalpation());
      setEnregistre(true);
    }
  }

  function programmer(e) {
    e.preventDefault();
    ajouterRappel({ type: "autopalpation", titre: "", pour: "Moi", date: jour, heure, recurrence: "mensuelle", note: "" });
    setRappel(rappelAutopalpation());
    setEnregistre(true);
  }

  if (etape === -1) {
    return (
      <div className="page page-etroite autopalpation">
        <span className="autopalpation-icone">
          <HandHeart size={30} />
        </span>
        <p className="surtitre">Se protéger</p>
        <h1 className="page-titre">L'autopalpation des seins, pas à pas</h1>
        <p className="page-sous-titre">5 étapes simples, environ 5 minutes, une fois par mois. Bien connaître ses seins aide à repérer tôt un changement.</p>

        {rappel && (
          <p className="autopalpation-statut">
            <AlarmClock size={18} />
            Prochain rappel : {formaterDate(rappel.date)}
            {derniere && <span> · dernier examen le {formaterDate(derniere)}</span>}
          </p>
        )}

        <div className="autopalpation-bloc">
          <Encadre Icone={Lock}>Cet examen se fait chez soi, en toute intimité. Rien n'est envoyé : seul le rappel est enregistré sur votre téléphone.</Encadre>
        </div>
        <button type="button" className="btn-principal btn-large autopalpation-bloc" onClick={() => setEtape(0)}>
          Commencer le guide
        </button>
        <p className="texte-doux autopalpation-note">L'autopalpation ne remplace pas l'examen par un soignant ni le dépistage.</p>
      </div>
    );
  }

  if (etape >= total) {
    return (
      <div className="page page-etroite autopalpation">
        <span className="autopalpation-icone autopalpation-icone-vert">
          <CircleCheck size={30} />
        </span>
        <h1 className="page-titre">Bravo, c'est fait pour ce mois-ci</h1>

        <h2 className="titre-section">Consultez un soignant si vous remarquez</h2>
        <ul className="autopalpation-signes">
          {signesAConsulter.map((s) => (
            <li key={s}>
              <TriangleAlert size={18} />
              {s}
            </li>
          ))}
        </ul>
        <Encadre>La plupart de ces changements ne sont pas un cancer. Mais seul un examen permet de le savoir : n'attendez pas, montrez-les à un soignant.</Encadre>
        <Link to="/centres" className="btn-principal btn-large autopalpation-bloc">
          <MapPin size={18} />
          Trouver un centre de santé
        </Link>

        <h2 className="titre-section">Mon rappel mensuel</h2>
        {rappel ? (
          <div className="carte autopalpation-rappel">
            <p>
              <Check size={18} /> {enregistre ? "Rappel enregistré" : "Rappel déjà programmé"} : prochain examen le <strong>{formaterDate(rappel.date)}</strong>.
            </p>
            <div className="rangee">
              <button type="button" className="btn-secondaire" onClick={() => ajouterAuCalendrier(rappel)}>
                <CalendarPlus size={18} />
                Ajouter à mon agenda
              </button>
              <Link to="/rappels" className="btn-texte">
                Voir mes rappels
              </Link>
            </div>
            <p className="texte-doux">L'agenda de votre téléphone vous préviendra chaque mois, même si l'application est fermée.</p>
          </div>
        ) : (
          <form className="carte autopalpation-rappel" onSubmit={programmer}>
            <p>Recevez un rappel chaque mois pour ne pas oublier.</p>
            <div className="autopalpation-champs">
              <label className="champ">
                Prochain examen
                <input type="date" value={jour} min={aujourdHui()} onChange={(e) => setJour(e.target.value)} required />
              </label>
              <label className="champ">
                Heure
                <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required />
              </label>
            </div>
            <button type="submit" className="btn-principal">
              <AlarmClock size={18} />
              Programmer le rappel mensuel
            </button>
          </form>
        )}

        <button type="button" className="btn-texte autopalpation-bloc" onClick={() => setEtape(0)}>
          Revoir le guide
        </button>
      </div>
    );
  }

  const courante = etapesAutopalpation[etape];

  return (
    <div className="page page-etroite autopalpation">
      <p className="texte-doux">
        Étape {etape + 1} sur {total}
      </p>
      <div className="autopalpation-barre" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={etape + 1}>
        {etapesAutopalpation.map((e, i) => (
          <span key={e.titre} className={i <= etape ? "fait" : ""} />
        ))}
      </div>

      <div className="carte autopalpation-etape">
        <span className="autopalpation-numero">{etape + 1}</span>
        <h1>{courante.titre}</h1>
        <p>{courante.texte}</p>
        <ul>
          {courante.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>

      <div className="autopalpation-navigation">
        <button type="button" className="btn-secondaire" onClick={() => setEtape(etape - 1)}>
          <ArrowLeft size={18} />
          {etape === 0 ? "Introduction" : "Précédent"}
        </button>
        {etape < total - 1 ? (
          <button type="button" className="btn-principal" onClick={() => setEtape(etape + 1)}>
            Suivant
            <ArrowRight size={18} />
          </button>
        ) : (
          <button type="button" className="btn-principal" onClick={terminer}>
            J'ai terminé
            <CircleCheck size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
