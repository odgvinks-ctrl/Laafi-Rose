import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronRight, ListChecks, NotebookPen, MessageCircle, Download, Stethoscope } from "lucide-react";
import CarteArticle from "../components/CarteArticle.jsx";
import Encadre from "../components/Encadre.jsx";
import { useArticles } from "../hooks/useArticles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { prenomCourt } from "../utils/texte.js";
import { devise } from "../data/marque.js";
import "./Accueil.css";

const raccourcis = [
  { vers: "/questionnaire", titre: "Tester mes connaissances", texte: "6 questions vrai ou faux", Icone: ListChecks },
  { vers: "/journal", titre: "Mon journal", texte: "Noter comment je me sens", Icone: NotebookPen },
  { vers: "/assistant", titre: "Poser une question", texte: "Réponses tirées de fiches validées", Icone: MessageCircle },
  { vers: "/enregistres", titre: "Mes contenus", texte: "Disponibles sans internet", Icone: Download },
];

export default function Accueil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { articles, synchro } = useArticles();
  const [recherche, setRecherche] = useState("");

  const aLaUne = articles.find((a) => a.slug === "cancer-du-sein") || articles[0];
  const autres = articles.filter((a) => a !== aLaUne).slice(0, 4);
  const prenom = prenomCourt(user);

  function rechercher(e) {
    e.preventDefault();
    const texte = recherche.trim();
    if (texte) navigate(`/sinformer?q=${encodeURIComponent(texte)}`);
  }

  return (
    <div className="page accueil">
      <section className="accueil-hero">
        <div className="accueil-hero-texte">
          <p className="surtitre">{prenom ? `Bonjour ${prenom}` : devise}</p>
          <h1 className="page-titre">Prendre soin de soi commence par s'informer.</h1>
          <p className="page-sous-titre">Recherchez un cancer, un signe ou un dépistage.</p>
          <form className="recherche accueil-recherche" role="search" onSubmit={rechercher}>
            <Search size={20} />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Ex. : sein, col, dépistage…"
              aria-label="Rechercher une fiche"
            />
          </form>
        </div>

        <Link to="/centres" className="accueil-centres">
          <span className="accueil-centres-icone">
            <MapPin size={26} />
          </span>
          <span className="accueil-centres-texte">
            <strong>Trouver un centre de santé</strong>
            <span>Dépistage, consultation, demande de rendez-vous</span>
          </span>
          <ChevronRight size={22} />
        </Link>
      </section>

      <h2 className="titre-section">Accès rapide</h2>
      <div className="accueil-raccourcis">
        {raccourcis.map(({ vers, titre, texte, Icone }) => (
          <Link key={vers} to={vers} className="carte accueil-raccourci">
            <Icone size={22} />
            <strong>{titre}</strong>
            <span>{texte}</span>
          </Link>
        ))}
      </div>

      <div className="accueil-fiches">
        <div>
          <h2 className="titre-section">À la une</h2>
          {aLaUne ? (
            <Link to={`/sinformer/${aLaUne.slug}`} className="accueil-une">
              <span className="surtitre">Fiche du moment</span>
              <span className="accueil-une-titre">{aLaUne.titre}</span>
              {aLaUne.resume && <span className="accueil-une-resume">{aLaUne.resume}</span>}
              <span className="accueil-une-lien">
                Lire la fiche <ChevronRight size={18} />
              </span>
            </Link>
          ) : (
            <div className="squelette accueil-une-vide">{synchro ? "" : "Les fiches s'afficheront dès que vous aurez du réseau."}</div>
          )}
        </div>

        <div>
          <div className="accueil-entete-liste">
            <h2 className="titre-section">Fiches principales</h2>
            <Link to="/sinformer" className="btn-texte">
              Tout voir
            </Link>
          </div>
          <div className="pile">
            {autres.map((article) => (
              <CarteArticle key={article.slug} article={article} />
            ))}
            {!autres.length && !synchro && <p className="texte-doux">Les autres fiches apparaîtront ici.</p>}
          </div>
        </div>
      </div>

      <div className="accueil-rappel">
        <Encadre Icone={Stethoscope} titre="Laafi Rose ne remplace pas un médecin">
          Elle vous informe et vous oriente. En cas de doute ou de signe qui dure plus de deux semaines, consultez un soignant.
        </Encadre>
      </div>
    </div>
  );
}
