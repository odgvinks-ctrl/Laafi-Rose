import { useNavigate } from "react-router-dom";
import { BookOpen, ShieldCheck, HeartHandshake } from "lucide-react";
import logo from "../assets/logo-laafi-rose.png";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { langues } from "../data/langues.js";
import "./Bienvenue.css";

const piliers = [
  { Icone: BookOpen, titre: "S’informer", texte: "Des fiches claires sur les cancers, relues par des soignants, à lire ou à écouter en français, mooré et dioula." },
  { Icone: ShieldCheck, titre: "Se protéger", texte: "Connaître les signes, se faire dépister et trouver un centre de santé près de chez vous." },
  { Icone: HeartHandshake, titre: "Vivre mieux", texte: "Suivre comment vous vous sentez et garder vos contenus avec vous, même sans internet." },
];

export default function Bienvenue() {
  const navigate = useNavigate();
  const { preferences, modifier } = usePreferences();

  function commencer() {
    modifier("introVue", true);
    navigate("/", { replace: true });
  }

  return (
    <div className="bienvenue">
      <section className="bienvenue-visuel">
        <img src={logo} alt="Laafi Rose · S’informer, se protéger, vivre mieux" className="bienvenue-logo" />
        <p className="bienvenue-citation">
          « Laafi » veut dire <em>la santé</em>, la paix du corps.
        </p>
      </section>

      <section className="bienvenue-contenu">
        <h1 className="page-titre">Bienvenue sur Laafi Rose</h1>
        <p className="page-sous-titre">L’application qui accompagne les femmes et les familles du Burkina Faso face aux cancers.</p>

        <ul className="bienvenue-piliers">
          {piliers.map(({ Icone, titre, texte }) => (
            <li key={titre}>
              <span className="bienvenue-pilier-icone">
                <Icone size={20} />
              </span>
              <span>
                <strong>{titre}</strong>
                <span>{texte}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="bienvenue-label">Langue des audios</p>
        <div className="segments">
          {langues.map((l) => (
            <button
              key={l.code}
              type="button"
              className={preferences.langueAudio === l.code ? "actif" : ""}
              aria-pressed={preferences.langueAudio === l.code}
              onClick={() => modifier("langueAudio", l.code)}
            >
              {l.nom}
            </button>
          ))}
        </div>

        <button type="button" className="btn-principal btn-large bienvenue-bouton" onClick={commencer}>
          Commencer
        </button>
        <p className="texte-doux bienvenue-note">Aucun compte n’est nécessaire. Laafi Rose ne remplace pas un médecin.</p>
      </section>
    </div>
  );
}
