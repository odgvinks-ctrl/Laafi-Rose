import { useState } from "react";
import { Link } from "react-router-dom";
import { NotebookPen, Plus, Trash2, TriangleAlert, Info, X } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import { lireJournal, ajouterEntree, supprimerEntree, signeInquietant } from "../utils/journal.js";
import { formaterDate } from "../utils/texte.js";
import "./Journal.css";

const vide = { humeur: 5, fatigue: 5, douleur: 0, fievre: false, saignement: false, note: "" };

function Curseur({ libelle, valeur, onChange }) {
  return (
    <label className="journal-curseur">
      <span>
        {libelle} <strong>{valeur}/10</strong>
      </span>
      <input type="range" min="0" max="10" step="1" value={valeur} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export default function Journal() {
  const [entrees, setEntrees] = useState(lireJournal);
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState(vide);
  const [alerte, setAlerte] = useState(false);

  function changer(cle, valeur) {
    setSaisie((actuel) => ({ ...actuel, [cle]: valeur }));
  }

  function enregistrer(e) {
    e.preventDefault();
    const entree = ajouterEntree({ ...saisie, note: saisie.note.trim() });
    setEntrees(lireJournal());
    setAlerte(signeInquietant(entree));
    setSaisie(vide);
    setOuvert(false);
  }

  function supprimer(id) {
    supprimerEntree(id);
    setEntrees(lireJournal());
  }

  return (
    <div className="page page-etroite journal">
      <div className="journal-entete">
        <div>
          <h1 className="page-titre">Mon journal</h1>
          <p className="page-sous-titre">Notez comment vous vous sentez. Ces notes restent sur cet appareil.</p>
        </div>
        {!ouvert && (
          <button type="button" className="btn-principal" onClick={() => setOuvert(true)}>
            <Plus size={18} />
            Noter aujourd'hui
          </button>
        )}
      </div>

      {alerte && (
        <div className="journal-bloc">
          <Encadre Icone={TriangleAlert} titre="Un signe mérite un avis médical" ton="rouge">
            Vous avez noté de la fièvre, un saignement ou une forte douleur. Parlez-en rapidement à un soignant.{" "}
            <Link to="/centres" className="journal-lien">
              Trouver un centre
            </Link>
          </Encadre>
        </div>
      )}

      {ouvert && (
        <form className="carte journal-formulaire" onSubmit={enregistrer}>
          <div className="journal-formulaire-haut">
            <h2>Comment allez-vous aujourd'hui ?</h2>
            <button type="button" className="journal-fermer" aria-label="Fermer" onClick={() => setOuvert(false)}>
              <X size={20} />
            </button>
          </div>
          <Curseur libelle="Moral" valeur={saisie.humeur} onChange={(v) => changer("humeur", v)} />
          <Curseur libelle="Fatigue" valeur={saisie.fatigue} onChange={(v) => changer("fatigue", v)} />
          <Curseur libelle="Douleur" valeur={saisie.douleur} onChange={(v) => changer("douleur", v)} />
          <label className="interrupteur">
            <span>J'ai de la fièvre</span>
            <input type="checkbox" checked={saisie.fievre} onChange={(e) => changer("fievre", e.target.checked)} />
          </label>
          <label className="interrupteur">
            <span>J'ai un saignement inhabituel</span>
            <input type="checkbox" checked={saisie.saignement} onChange={(e) => changer("saignement", e.target.checked)} />
          </label>
          <label className="champ">
            Une remarque ? (facultatif)
            <textarea value={saisie.note} onChange={(e) => changer("note", e.target.value)} maxLength={500} />
          </label>
          <button type="submit" className="btn-principal btn-large">
            Enregistrer
          </button>
        </form>
      )}

      {entrees.length ? (
        <ul className="journal-liste">
          {entrees.map((entree) => {
            const details = [
              `Moral ${entree.humeur}/10`,
              `Fatigue ${entree.fatigue}/10`,
              `Douleur ${entree.douleur}/10`,
              entree.fievre && "Fièvre",
              entree.saignement && "Saignement",
            ].filter(Boolean);
            return (
              <li key={entree.id} className={signeInquietant(entree) ? "carte journal-entree inquietant" : "carte journal-entree"}>
                <div>
                  <strong>{formaterDate(entree.date)}</strong>
                  <p>{details.join(" · ")}</p>
                  {entree.note && <p className="texte-doux">{entree.note}</p>}
                </div>
                <button type="button" className="journal-supprimer" aria-label="Supprimer cette note" onClick={() => supprimer(entree.id)}>
                  <Trash2 size={18} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        !ouvert && <EtatVide Icone={NotebookPen} titre="Aucune note pour le moment" texte="Une note par jour aide à expliquer au soignant comment vous allez." />
      )}

      <div className="journal-bloc">
        <Encadre Icone={Info} ton="sable">
          Ce journal ne remplace pas un suivi médical. Montrez-le à votre soignant lors de vos rendez-vous.
        </Encadre>
      </div>
    </div>
  );
}
