import { Link, useSearchParams } from "react-router-dom";
import { Search, X, SearchX, Info, RefreshCw } from "lucide-react";
import CarteArticle from "../components/CarteArticle.jsx";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import { useArticles } from "../hooks/useArticles.js";
import { categories } from "../data/categories.js";
import { sansAccents } from "../utils/texte.js";
import "./Sinformer.css";

export default function Sinformer() {
  const [params, setParams] = useSearchParams();
  const { articles, synchro, erreur, actualiser } = useArticles();

  const recherche = params.get("q") || "";
  const categorie = params.get("categorie") || "";

  function changer(cle, valeur) {
    const suivants = new URLSearchParams(params);
    if (valeur) {
      suivants.set(cle, valeur);
    } else {
      suivants.delete(cle);
    }
    setParams(suivants, { replace: true });
  }

  const mot = sansAccents(recherche.trim());
  const resultats = articles.filter((a) => {
    if (categorie && a.categorie !== categorie) return false;
    if (!mot) return true;
    return sansAccents(`${a.titre} ${a.resume || ""} ${a.contenu}`).includes(mot);
  });

  return (
    <div className="page sinformer">
      <div className="sinformer-entete">
        <div>
          <h1 className="page-titre">S'informer</h1>
          <p className="page-sous-titre">Les cancers, les facteurs de risque et les dépistages possibles.</p>
        </div>
        <button type="button" className="btn-secondaire" onClick={actualiser} disabled={synchro}>
          <RefreshCw size={18} className={synchro ? "tourne" : ""} />
          {synchro ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </div>

      <div className="sinformer-filtres">
        <div className="recherche">
          <Search size={20} />
          <input
            type="search"
            value={recherche}
            onChange={(e) => changer("q", e.target.value)}
            placeholder="Rechercher une fiche"
            aria-label="Rechercher une fiche"
          />
          {recherche && (
            <button type="button" aria-label="Effacer la recherche" onClick={() => changer("q", "")}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="puces" role="group" aria-label="Rubriques">
          <button type="button" className={!categorie ? "puce actif" : "puce"} onClick={() => changer("categorie", "")}>
            Tout
          </button>
          {categories.map((c) => (
            <button key={c.code} type="button" className={categorie === c.code ? "puce actif" : "puce"} onClick={() => changer("categorie", c.code)}>
              {c.nom}
            </button>
          ))}
        </div>
      </div>

      {categorie === "facteurs" && (
        <Encadre Icone={Info}>Un facteur de risque n'est pas une maladie. Il augmente un risque, il ne veut pas dire qu'un cancer va apparaître.</Encadre>
      )}

      {erreur && !articles.length ? (
        <EtatVide Icone={SearchX} titre="Aucune fiche sur cet appareil" texte={erreur}>
          <button type="button" className="btn-secondaire" onClick={actualiser}>
            Réessayer
          </button>
        </EtatVide>
      ) : resultats.length ? (
        <>
          <p className="texte-doux sinformer-compte">
            {resultats.length} fiche{resultats.length > 1 ? "s" : ""}
          </p>
          <div className="grille grille-2">
            {resultats.map((article) => (
              <CarteArticle key={article.slug} article={article} />
            ))}
          </div>
        </>
      ) : synchro ? (
        <div className="grille grille-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="squelette sinformer-squelette" />
          ))}
        </div>
      ) : (
        <EtatVide
          Icone={SearchX}
          titre={recherche ? `Aucune fiche ne correspond à « ${recherche} »` : "Aucune fiche dans cette rubrique pour le moment"}
          texte="Essayez un mot plus simple, par exemple « sein » ou « col »."
        >
          <Link to="/assistant" className="btn-principal">
            Poser la question à l'assistant
          </Link>
        </EtatVide>
      )}
    </div>
  );
}
