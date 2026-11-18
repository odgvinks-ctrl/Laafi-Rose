import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserRound, LogOut, NotebookPen, Bell, ChevronRight, Lock, Hourglass, CalendarCheck, CalendarX, HandHeart, AlarmClock, ClipboardList, Building2, ShieldCheck } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { modifierProfil } from "../api/auth.js";
import { mesDemandes } from "../api/rendezVous.js";
import { langues } from "../data/langues.js";
import { dateCourte, prenomCourt } from "../utils/texte.js";
import { estAdmin, estPro, libellesRoles, peutGererCentre, roleDe } from "../utils/roles.js";
import "./Profil.css";

const tailles = [
  { code: "standard", nom: "Normal" },
  { code: "grand", nom: "Grand" },
  { code: "tres_grand", nom: "Très grand" },
];

const statuts = {
  en_attente: { texte: "En attente", Icone: Hourglass, classe: "badge-ambre" },
  confirme: { texte: "Confirmé", Icone: CalendarCheck, classe: "badge-vert" },
  honore: { texte: "Effectué", Icone: CalendarCheck, classe: "badge-neutre" },
  annule: { texte: "Annulé", Icone: CalendarX, classe: "badge-rouge" },
  absent: { texte: "Absent", Icone: CalendarX, classe: "badge-rouge" },
};

export default function Profil() {
  const { user, logout } = useAuth();
  const { preferences, modifier } = usePreferences();
  const [demandes, setDemandes] = useState(null);
  const [erreurDemandes, setErreurDemandes] = useState("");
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let actif = true;
    mesDemandes().then(
      (liste) => actif && setDemandes(liste),
      (e) => actif && setErreurDemandes(e.message),
    );
    return () => {
      actif = false;
    };
  }, [userId]);

  function changerPreference(cle, valeur, champServeur) {
    modifier(cle, valeur);
    if (user && navigator.onLine) modifierProfil({ [champServeur]: valeur }).catch(() => {});
  }

  return (
    <div className="page page-etroite profil">
      <h1 className="page-titre">Profil et préférences</h1>

      <h2 className="titre-section">Mon compte</h2>
      {user ? (
        <div className="carte profil-compte">
          <div className="profil-identite">
            <span className="profil-avatar">
              <UserRound size={24} />
            </span>
            <div>
              <strong>{prenomCourt(user) || "Mon compte"}</strong>
              <p className="texte-doux">{user.phone}</p>
            </div>
          </div>

          <p className="profil-sous-titre">Mes demandes de rendez-vous</p>
          {erreurDemandes ? (
            <p className="texte-doux">{erreurDemandes}</p>
          ) : !demandes ? (
            <p className="texte-doux">Chargement…</p>
          ) : demandes.length ? (
            <ul className="profil-demandes">
              {demandes.map((d) => {
                const statut = statuts[d.status] || statuts.en_attente;
                return (
                  <li key={d.reference}>
                    <Link to={`/centres/${d.health_center_id}`}>
                      <span>
                        <strong>Réf. {d.reference}</strong>
                        <span className="texte-doux">Envoyée le {dateCourte(d.created_at)}</span>
                      </span>
                      <span className={`badge ${statut.classe}`}>
                        <statut.Icone size={14} />
                        {statut.texte}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="texte-doux">Vous n'avez pas encore fait de demande.</p>
          )}

          <button type="button" className="btn-secondaire" onClick={logout}>
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      ) : (
        <div className="carte profil-compte">
          <p>Un compte n'est pas nécessaire. Il sert seulement à suivre vos demandes de rendez-vous et à recevoir les réponses des centres.</p>
          <Link to="/connexion" className="btn-principal">
            Se connecter ou créer un compte
          </Link>
        </div>
      )}

      <h2 className="titre-section">Langue des audios</h2>
      <div className="segments">
        {langues.map((l) => (
          <button
            key={l.code}
            type="button"
            className={preferences.langueAudio === l.code ? "actif" : ""}
            aria-pressed={preferences.langueAudio === l.code}
            onClick={() => changerPreference("langueAudio", l.code, "language")}
          >
            {l.nom}
          </button>
        ))}
      </div>

      <h2 className="titre-section">Taille du texte</h2>
      <div className="segments">
        {tailles.map((t) => (
          <button
            key={t.code}
            type="button"
            className={preferences.tailleTexte === t.code ? "actif" : ""}
            aria-pressed={preferences.tailleTexte === t.code}
            onClick={() => changerPreference("tailleTexte", t.code, "text_size")}
          >
            {t.nom}
          </button>
        ))}
      </div>

      <label className="interrupteur profil-wifi">
        <span>
          Télécharger les audios de préférence en Wi-Fi
          <span className="texte-doux">Pour économiser vos données mobiles</span>
        </span>
        <input type="checkbox" checked={preferences.wifiSeulement} onChange={(e) => modifier("wifiSeulement", e.target.checked)} />
      </label>

      {estPro(user) && (
        <>
          <h2 className="titre-section">Espace professionnel · {libellesRoles[roleDe(user)]}</h2>
          <ul className="carte profil-liens">
            <li>
              <Link to="/pro">
                <ClipboardList size={20} />
                Demandes de rendez-vous
                <ChevronRight size={18} />
              </Link>
            </li>
            {peutGererCentre(user) && (
              <li>
                <Link to="/pro/centre">
                  <Building2 size={20} />
                  Mon centre
                  <ChevronRight size={18} />
                </Link>
              </li>
            )}
            {estAdmin(user) && (
              <li>
                <Link to="/admin">
                  <ShieldCheck size={20} />
                  Administration
                  <ChevronRight size={18} />
                </Link>
              </li>
            )}
          </ul>
        </>
      )}

      <h2 className="titre-section">Mon espace</h2>
      <ul className="carte profil-liens">
        <li>
          <Link to="/autopalpation">
            <HandHeart size={20} />
            Autopalpation guidée
            <ChevronRight size={18} />
          </Link>
        </li>
        <li>
          <Link to="/rappels">
            <AlarmClock size={20} />
            Mes rappels
            <ChevronRight size={18} />
          </Link>
        </li>
        <li>
          <Link to="/journal">
            <NotebookPen size={20} />
            Mon journal
            <ChevronRight size={18} />
          </Link>
        </li>
        <li>
          <Link to="/notifications">
            <Bell size={20} />
            Notifications
            <ChevronRight size={18} />
          </Link>
        </li>
      </ul>

      <div className="profil-confidentialite">
        <Encadre Icone={Lock} titre="Confidentialité">
          Votre journal et vos contenus enregistrés restent sur cet appareil. Les fiches viennent de sources reconnues (OMS, ministère de la Santé) et sont relues par des soignants.
        </Encadre>
      </div>
    </div>
  );
}
