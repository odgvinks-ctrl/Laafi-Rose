import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Headphones, Trash2, HardDrive } from "lucide-react";
import CarteArticle from "../components/CarteArticle.jsx";
import EtatVide from "../components/EtatVide.jsx";
import { articlesEnregistres } from "../api/articles.js";
import { audiosEnregistres, espaceUtilise, supprimerAudio } from "../utils/audiosHorsLigne.js";
import { nomLangue } from "../data/langues.js";
import { taille } from "../utils/texte.js";
import "./Enregistres.css";

export default function Enregistres() {
  const [articles] = useState(articlesEnregistres);
  const [audios, setAudios] = useState(audiosEnregistres);
  const [aSupprimer, setASupprimer] = useState(null);

  async function confirmerSuppression() {
    await supprimerAudio(aSupprimer);
    setAudios(audiosEnregistres());
    setASupprimer(null);
  }

  if (!articles.length && !audios.length) {
    return (
      <div className="page page-etroite">
        <h1 className="page-titre">Enregistrés</h1>
        <EtatVide Icone={Download} titre="Rien pour le moment" texte="Enregistrez une fiche ou un audio pour l'avoir avec vous, même sans réseau.">
          <Link to="/sinformer" className="btn-principal">
            Parcourir les fiches
          </Link>
        </EtatVide>
      </div>
    );
  }

  return (
    <div className="page enregistres">
      <h1 className="page-titre">Enregistrés</h1>
      <p className="page-sous-titre">Consultables sans connexion internet.</p>

      <p className="enregistres-espace">
        <HardDrive size={18} />
        Espace utilisé par les audios : {taille(espaceUtilise())}
      </p>

      {articles.length > 0 && (
        <>
          <h2 className="titre-section">Fiches ({articles.length})</h2>
          <div className="grille grille-2">
            {articles.map((article) => (
              <CarteArticle key={article.slug} article={article} />
            ))}
          </div>
        </>
      )}

      {audios.length > 0 && (
        <>
          <h2 className="titre-section">Audios ({audios.length})</h2>
          <ul className="grille grille-2">
            {audios.map((audio) => (
              <li key={`${audio.slug}-${audio.langue}`} className="carte enregistres-audio">
                <Link to={`/ecouter/${audio.slug}`} className="enregistres-audio-lien">
                  <span className="enregistres-audio-icone">
                    <Headphones size={20} />
                  </span>
                  <span>
                    <strong>{audio.titre}</strong>
                    <span className="texte-doux">
                      {nomLangue(audio.langue)} · {taille(audio.taille)}
                    </span>
                  </span>
                </Link>
                {aSupprimer === audio ? (
                  <span className="enregistres-confirmer">
                    <button type="button" className="btn-texte" onClick={() => setASupprimer(null)}>
                      Annuler
                    </button>
                    <button type="button" className="btn-texte enregistres-supprimer" onClick={confirmerSuppression}>
                      Supprimer
                    </button>
                  </span>
                ) : (
                  <button type="button" className="enregistres-poubelle" aria-label={`Supprimer l'audio ${audio.titre}`} onClick={() => setASupprimer(audio)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
