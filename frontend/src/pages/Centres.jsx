import { useEffect, useState } from "react";
import { Search, LocateFixed, Navigation, BadgeCheck, MapPinOff, SearchX } from "lucide-react";
import CarteCentre from "../components/CarteCentre.jsx";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { listerCentres } from "../api/centres.js";
import { useGeolocalisation } from "../hooks/useGeolocalisation.js";
import "./Centres.css";

export default function Centres() {
  const geo = useGeolocalisation();
  const [saisie, setSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [verifies, setVerifies] = useState(false);
  const [centres, setCentres] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);

  const position = geo.position;

  useEffect(() => {
    let actif = true;
    listerCentres({ recherche, verifies, position }).then(
      (liste) => {
        if (!actif) return;
        setCentres(liste);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [recherche, verifies, position, essai]);

  function valider(e) {
    e.preventDefault();
    setCentres(null);
    setRecherche(saisie.trim());
  }

  function reinitialiser() {
    setSaisie("");
    setRecherche("");
    setVerifies(false);
  }

  return (
    <div className="page centres">
      <h1 className="page-titre">Centres de santé</h1>
      <p className="page-sous-titre">Trouvez un centre de dépistage ou de soins près de chez vous.</p>

      <div className="centres-filtres">
        <form className="recherche" role="search" onSubmit={valider}>
          <Search size={20} />
          <input
            type="search"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Nom du centre, ville, quartier"
            aria-label="Rechercher un centre"
          />
        </form>
        <div className="puces">
          <button type="button" className={verifies ? "puce actif" : "puce"} aria-pressed={verifies} onClick={() => setVerifies(!verifies)}>
            <BadgeCheck size={16} />
            Infos vérifiées
          </button>
          <button type="button" className={position ? "puce actif" : "puce"} onClick={geo.demander} disabled={geo.enCours}>
            {position ? <Navigation size={16} /> : <LocateFixed size={16} />}
            {geo.enCours ? "Localisation…" : position ? "Triés par distance" : "Près de moi"}
          </button>
        </div>
      </div>

      {!position && (
        <Encadre Icone={MapPinOff} ton="sable">
          {geo.erreur || "Les centres sont classés par nom. Touchez « Près de moi » pour voir les plus proches. Votre position sert seulement à ce tri."}
        </Encadre>
      )}

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !centres ? (
        <div className="grille grille-2 centres-liste">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="squelette centres-squelette" />
          ))}
        </div>
      ) : centres.length ? (
        <>
          <p className="texte-doux centres-compte">
            {centres.length} centre{centres.length > 1 ? "s" : ""}
          </p>
          <div className="grille grille-2">
            {centres.map((centre) => (
              <CarteCentre key={centre.id} centre={centre} />
            ))}
          </div>
        </>
      ) : (
        <EtatVide Icone={SearchX} titre="Aucun centre trouvé" texte="Essayez un autre nom ou retirez les filtres.">
          <button type="button" className="btn-secondaire" onClick={reinitialiser}>
            Réinitialiser la recherche
          </button>
        </EtatVide>
      )}
    </div>
  );
}
