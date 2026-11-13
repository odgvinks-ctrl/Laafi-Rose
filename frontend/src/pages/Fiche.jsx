import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Headphones, MapPin, Stethoscope, Clock } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { obtenirArticle, estEnregistre, basculerEnregistrement } from "../api/articles.js";
import { nomCategorie } from "../data/categories.js";
import { nomLangue } from "../data/langues.js";
import { formaterDate } from "../utils/texte.js";
import "./Fiche.css";

function ContenuArticle({ texte }) {
  const blocs = texte.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return blocs.map((bloc, i) => {
    if (bloc.startsWith("## ")) {
      return <h2 key={i}>{bloc.slice(3)}</h2>;
    }
    const lignes = bloc.split("\n");
    if (lignes.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i}>
          {lignes.map((l) => (
            <li key={l}>{l.slice(2)}</li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{bloc}</p>;
  });
}

export default function Fiche() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [erreur, setErreur] = useState("");
  const [, setVersion] = useState(0);
  const enregistre = estEnregistre(slug);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let actif = true;
    obtenirArticle(slug).then(
      (a) => {
        if (!actif) return;
        setArticle(a);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [slug, essai]);

  if (erreur) {
    return (
      <div className="page page-etroite">
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
        <div className="fiche-retour-centre">
          <Link to="/enregistres" className="btn-texte">
            Voir les fiches disponibles hors connexion
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page page-etroite">
        <div className="squelette fiche-squelette" />
      </div>
    );
  }

  const audios = Object.keys(article.audios || {});

  return (
    <div className="page fiche">
      <button type="button" className="btn-texte fiche-retour" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="fiche-grille">
        <article className="fiche-article">
          <p className="surtitre">{nomCategorie(article.categorie)}</p>
          <h1 className="page-titre">{article.titre}</h1>
          <p className="fiche-meta">
            <Clock size={15} />
            {article.lecture_minutes} min de lecture
            {article.revise_le && <span> · Relue le {formaterDate(article.revise_le)}</span>}
          </p>

          <div className="fiche-actions">
            {audios.length > 0 && (
              <Link to={`/ecouter/${article.slug}`} className="btn-principal">
                <Headphones size={18} />
                Écouter · {audios.map(nomLangue).join(", ")}
              </Link>
            )}
            <button
              type="button"
              className="btn-secondaire"
              aria-pressed={enregistre}
              onClick={() => {
                basculerEnregistrement(article.slug);
                setVersion((v) => v + 1);
              }}
            >
              {enregistre ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              {enregistre ? "Enregistrée" : "Enregistrer"}
            </button>
          </div>

          {article.resume && <p className="fiche-resume">{article.resume}</p>}

          <div className="fiche-contenu">
            <ContenuArticle texte={article.contenu} />
          </div>
        </article>

        <aside className="fiche-cote">
          <Encadre Icone={Stethoscope} titre="Quand consulter ?">
            Si un signe apparaît et dure plus de deux semaines, montrez-vous à un soignant. La plupart du temps, ce n'est pas un cancer, mais seul un examen permet de le savoir.
          </Encadre>
          <Link to="/centres" className="btn-principal btn-large">
            <MapPin size={18} />
            Trouver un centre de santé
          </Link>

          {article.sources?.length > 0 && (
            <div className="carte fiche-sources">
              <p className="surtitre">Sources</p>
              <ul>
                {article.sources.map((s) => (
                  <li key={`${s.organisation}-${s.title}`}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    ) : (
                      s.title
                    )}
                    {s.organisation && <span> · {s.organisation}</span>}
                    {s.year && <span> ({s.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
