import { Link } from "react-router-dom";
import { Clock, Headphones, BookmarkCheck } from "lucide-react";
import { nomCategorie } from "../data/categories.js";
import { estEnregistre } from "../api/articles.js";
import "./CarteArticle.css";

export default function CarteArticle({ article }) {
  const audios = Object.keys(article.audios || {});

  return (
    <Link to={`/sinformer/${article.slug}`} className="carte carte-article">
      <span className="carte-article-monogramme" aria-hidden="true">
        {article.titre.charAt(0)}
      </span>
      <span className="carte-article-corps">
        <span className="surtitre">{nomCategorie(article.categorie)}</span>
        <span className="carte-article-titre">{article.titre}</span>
        {article.resume && <span className="carte-article-resume">{article.resume}</span>}
        <span className="carte-article-meta">
          <span>
            <Clock size={14} />
            {article.lecture_minutes} min
          </span>
          {audios.length > 0 && (
            <span>
              <Headphones size={14} />
              Audio
            </span>
          )}
          {estEnregistre(article.slug) && (
            <span className="carte-article-hors-ligne">
              <BookmarkCheck size={14} />
              Enregistrée
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}
