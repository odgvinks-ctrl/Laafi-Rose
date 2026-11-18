import { useState } from "react";
import { Link } from "react-router-dom";
import { AlarmClock, Plus, X, BellRing, BellOff, CalendarPlus, Check, Trash2, Repeat, HandHeart, Syringe, Microscope } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import { recurrences, typeRappel, typesRappels } from "../data/typesRappels.js";
import {
  ajouterRappel,
  aujourdHui,
  autoriserNotifications,
  lireRappels,
  marquerFait,
  notificationsPossibles,
  rappelsAVenir,
  rappelsEchus,
  supprimerRappel,
  titreRappel,
} from "../utils/rappels.js";
import { ajouterAuCalendrier } from "../utils/calendrier.js";
import { formaterDate } from "../utils/texte.js";
import "./Rappels.css";

const suggestions = [
  { type: "vaccin_hpv", Icone: Syringe, pour: "Ma fille" },
  { type: "depistage_col", Icone: Microscope, pour: "Moi" },
];

function nouveauFormulaire(type = "vaccin_hpv", pour = "Moi") {
  return { type, titre: "", pour, date: aujourdHui(), heure: "09:00", recurrence: typeRappel(type).recurrence, note: "" };
}

function etatNotifications() {
  if (!notificationsPossibles()) return "indisponible";
  return Notification.permission;
}

function CarteRappel({ rappel, echu, onFait, onSupprimer }) {
  const [confirmer, setConfirmer] = useState(false);
  const type = typeRappel(rappel.type);

  return (
    <li className={echu ? "carte rappel rappel-echu" : "carte rappel"}>
      <div className="rappel-haut">
        <div>
          <strong>{titreRappel(rappel)}</strong>
          <span className="texte-doux">
            {rappel.pour && `Pour : ${rappel.pour} · `}
            {formaterDate(rappel.date)} à {rappel.heure}
          </span>
        </div>
        {rappel.recurrence !== "aucune" && (
          <span className="badge badge-rose">
            <Repeat size={12} />
            {rappel.recurrence === "mensuelle" ? "Chaque mois" : "Chaque année"}
          </span>
        )}
      </div>
      {rappel.note && <p className="rappel-note">{rappel.note}</p>}
      <div className="rappel-actions">
        {echu && (
          <button type="button" className="btn-principal" onClick={() => onFait(rappel.id)}>
            <Check size={18} />
            C'est fait
          </button>
        )}
        {rappel.type === "autopalpation" && echu && (
          <Link to="/autopalpation" className="btn-secondaire">
            <HandHeart size={18} />
            Ouvrir le guide
          </Link>
        )}
        <button type="button" className="btn-texte" onClick={() => ajouterAuCalendrier(rappel)}>
          <CalendarPlus size={18} />
          Agenda
        </button>
        {confirmer ? (
          <span className="rangee">
            <button type="button" className="btn-texte" onClick={() => setConfirmer(false)}>
              Garder
            </button>
            <button type="button" className="btn-texte rappel-supprimer" onClick={() => onSupprimer(rappel.id)}>
              Supprimer
            </button>
          </span>
        ) : (
          <button type="button" className="rappel-poubelle" aria-label={`Supprimer le rappel ${type.nom}`} onClick={() => setConfirmer(true)}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </li>
  );
}

export default function Rappels() {
  const [rappels, setRappels] = useState(lireRappels);
  const [formulaire, setFormulaire] = useState(null);
  const [notifications, setNotifications] = useState(etatNotifications);
  const [erreur, setErreur] = useState("");

  const echus = rappelsEchus(rappels);
  const aVenir = rappelsAVenir(rappels);
  const termines = rappels.filter((r) => r.fait);

  function changer(cle, valeur) {
    setFormulaire((actuel) => {
      const suivant = { ...actuel, [cle]: valeur };
      if (cle === "type") suivant.recurrence = typeRappel(valeur).recurrence;
      return suivant;
    });
  }

  function enregistrer(e) {
    e.preventDefault();
    if (formulaire.type === "autre" && !formulaire.titre.trim()) {
      setErreur("Donnez un nom à ce rappel.");
      return;
    }
    setRappels(ajouterRappel({ ...formulaire, titre: formulaire.titre.trim(), pour: formulaire.pour.trim(), note: formulaire.note.trim() }));
    setFormulaire(null);
    setErreur("");
  }

  async function activerNotifications() {
    setNotifications(await autoriserNotifications());
  }

  const conseil = formulaire ? typeRappel(formulaire.type).conseil : "";

  return (
    <div className="page page-etroite rappels">
      <div className="rappels-entete">
        <div>
          <p className="surtitre">Se protéger</p>
          <h1 className="page-titre">Mes rappels</h1>
          <p className="page-sous-titre">Vaccins, dépistages, autopalpation : n'oubliez plus rien.</p>
        </div>
        {!formulaire && (
          <button type="button" className="btn-principal" onClick={() => setFormulaire(nouveauFormulaire())}>
            <Plus size={18} />
            Nouveau rappel
          </button>
        )}
      </div>

      {notifications === "default" && (
        <div className="rappels-bloc">
          <Encadre Icone={BellRing} titre="Être prévenue à l'ouverture de l'application">
            <p>Autorisez les notifications pour voir vos rappels du jour dès que vous ouvrez Laafi Rose.</p>
            <button type="button" className="btn-secondaire rappels-autoriser" onClick={activerNotifications}>
              Activer les notifications
            </button>
          </Encadre>
        </div>
      )}
      {notifications === "denied" && (
        <div className="rappels-bloc">
          <Encadre Icone={BellOff} ton="sable">
            Les notifications sont bloquées. Utilisez le bouton « Agenda » de chaque rappel pour que votre téléphone vous prévienne.
          </Encadre>
        </div>
      )}

      {formulaire && (
        <form className="carte rappels-formulaire" onSubmit={enregistrer}>
          <div className="rappels-formulaire-haut">
            <h2>Nouveau rappel</h2>
            <button type="button" className="rappels-fermer" aria-label="Fermer" onClick={() => setFormulaire(null)}>
              <X size={20} />
            </button>
          </div>
          <label className="champ">
            Type de rappel
            <select value={formulaire.type} onChange={(e) => changer("type", e.target.value)}>
              {typesRappels.map((t) => (
                <option key={t.code} value={t.code}>
                  {t.nom}
                </option>
              ))}
            </select>
          </label>
          {conseil && <p className="rappels-conseil">{conseil}</p>}
          {formulaire.type === "autre" && (
            <label className="champ">
              Nom du rappel
              <input type="text" value={formulaire.titre} onChange={(e) => changer("titre", e.target.value)} maxLength={80} />
            </label>
          )}
          <label className="champ">
            Pour qui ?
            <input type="text" list="rappels-pour" value={formulaire.pour} onChange={(e) => changer("pour", e.target.value)} maxLength={60} />
            <datalist id="rappels-pour">
              <option value="Moi" />
              <option value="Ma fille" />
              <option value="Ma mère" />
            </datalist>
          </label>
          <div className="rappels-champs">
            <label className="champ">
              Date
              <input type="date" value={formulaire.date} onChange={(e) => changer("date", e.target.value)} required />
            </label>
            <label className="champ">
              Heure
              <input type="time" value={formulaire.heure} onChange={(e) => changer("heure", e.target.value)} required />
            </label>
          </div>
          <div className="champ">
            Répéter
            <div className="segments">
              {recurrences.map((r) => (
                <button key={r.code} type="button" className={formulaire.recurrence === r.code ? "actif" : ""} aria-pressed={formulaire.recurrence === r.code} onClick={() => changer("recurrence", r.code)}>
                  {r.nom}
                </button>
              ))}
            </div>
          </div>
          <label className="champ">
            Note (facultatif)
            <input type="text" value={formulaire.note} onChange={(e) => changer("note", e.target.value)} placeholder="Ex. : 2e dose, apporter le carnet" maxLength={200} />
          </label>
          {erreur && <p className="champ-erreur">{erreur}</p>}
          <button type="submit" className="btn-principal btn-large">
            Enregistrer le rappel
          </button>
        </form>
      )}

      {echus.length > 0 && (
        <>
          <h2 className="titre-section">À faire maintenant</h2>
          <ul className="pile">
            {echus.map((r) => (
              <CarteRappel key={r.id} rappel={r} echu onFait={(id) => setRappels(marquerFait(id))} onSupprimer={(id) => setRappels(supprimerRappel(id))} />
            ))}
          </ul>
        </>
      )}

      {aVenir.length > 0 && (
        <>
          <h2 className="titre-section">À venir</h2>
          <ul className="pile">
            {aVenir.map((r) => (
              <CarteRappel key={r.id} rappel={r} onFait={(id) => setRappels(marquerFait(id))} onSupprimer={(id) => setRappels(supprimerRappel(id))} />
            ))}
          </ul>
        </>
      )}

      {!echus.length && !aVenir.length && !formulaire && (
        <>
          <EtatVide Icone={AlarmClock} titre="Aucun rappel pour le moment" texte="Voici quelques rappels utiles pour commencer." />
          <div className="grille grille-2 rappels-suggestions">
            <Link to="/autopalpation" className="carte rappels-suggestion">
              <HandHeart size={22} />
              <strong>Autopalpation mensuelle</strong>
              <span>Le guide pas à pas et son rappel chaque mois</span>
            </Link>
            {suggestions.map(({ type, Icone, pour }) => (
              <button key={type} type="button" className="carte rappels-suggestion" onClick={() => setFormulaire(nouveauFormulaire(type, pour))}>
                <Icone size={22} />
                <strong>{typeRappel(type).nom}</strong>
                <span>{typeRappel(type).conseil}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {termines.length > 0 && (
        <details className="rappels-termines">
          <summary>Rappels terminés ({termines.length})</summary>
          <ul>
            {termines.map((r) => (
              <li key={r.id}>
                <Check size={16} />
                {titreRappel(r)} · {formaterDate(r.historique?.[r.historique.length - 1] || r.date)}
                <button type="button" className="btn-texte" onClick={() => setRappels(supprimerRappel(r.id))}>
                  Effacer
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="rappels-bloc">
        <Encadre ton="sable">Vos rappels restent sur cet appareil. Pour être prévenue même application fermée, ajoutez-les à l'agenda de votre téléphone.</Encadre>
      </div>
    </div>
  );
}
