import { useEffect } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { House, BookOpen, MapPin, MessageCircle, Download, NotebookPen, Bell, UserRound, Stethoscope, HandHeart, AlarmClock, ClipboardList, Building2, ShieldCheck, BriefcaseMedical } from "lucide-react";
import Logo from "./Logo.jsx";
import { devise } from "../data/marque.js";
import BandeHorsConnexion from "./BandeHorsConnexion.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { estAdmin, estPro, peutGererCentre } from "../utils/roles.js";
import { notifierRappelsEchus } from "../utils/rappels.js";
import "./Layout.css";

const onglets = [
  { vers: "/", libelle: "Accueil", Icone: House, exact: true },
  { vers: "/sinformer", libelle: "S'informer", Icone: BookOpen },
  { vers: "/centres", libelle: "Centres", Icone: MapPin },
  { vers: "/assistant", libelle: "Assistant", Icone: MessageCircle },
  { vers: "/enregistres", libelle: "Enregistrés", Icone: Download },
];

const liensPerso = [
  { vers: "/autopalpation", libelle: "Autopalpation guidée", Icone: HandHeart },
  { vers: "/rappels", libelle: "Mes rappels", Icone: AlarmClock },
  { vers: "/journal", libelle: "Mon journal", Icone: NotebookPen },
  { vers: "/notifications", libelle: "Notifications", Icone: Bell },
  { vers: "/profil", libelle: "Profil et préférences", Icone: UserRound },
];

function liensProDe(user) {
  const liens = [];
  if (estPro(user)) liens.push({ vers: "/pro", libelle: "Demandes de rendez-vous", Icone: ClipboardList, exact: true });
  if (peutGererCentre(user)) liens.push({ vers: "/pro/centre", libelle: "Mon centre", Icone: Building2 });
  if (estAdmin(user)) liens.push({ vers: "/admin", libelle: "Administration", Icone: ShieldCheck });
  return liens;
}

function classeLien({ isActive }) {
  return isActive ? "lien-nav actif" : "lien-nav";
}

export default function Layout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const { preferences } = usePreferences();
  const liensPro = liensProDe(user);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    notifierRappelsEchus();
  }, []);

  if (!preferences.introVue) {
    return <Navigate to="/bienvenue" replace />;
  }

  return (
    <div className="app">
      <aside className="menu-lateral">
        <Link to="/" className="menu-logo" aria-label="Accueil Laafi Rose">
          <Logo taille={44} />
          <span className="menu-devise">{devise}</span>
        </Link>
        <nav className="menu-liens" aria-label="Navigation principale">
          {onglets.map(({ vers, libelle, Icone, exact }) => (
            <NavLink key={vers} to={vers} end={exact} className={classeLien}>
              <Icone size={20} />
              <span>{libelle}</span>
            </NavLink>
          ))}
          <span className="menu-separateur" />
          {liensPerso.map(({ vers, libelle, Icone }) => (
            <NavLink key={vers} to={vers} className={classeLien}>
              <Icone size={20} />
              <span>{libelle}</span>
            </NavLink>
          ))}
          {liensPro.length > 0 && (
            <>
              <span className="menu-separateur" />
              <span className="menu-groupe">Espace professionnel</span>
              {liensPro.map(({ vers, libelle, Icone, exact }) => (
                <NavLink key={vers} to={vers} end={exact} className={classeLien}>
                  <Icone size={20} />
                  <span>{libelle}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="menu-pied">
          <div className="menu-rappel">
            <Stethoscope size={18} />
            <p>Laafi Rose informe et oriente. Elle ne remplace jamais un médecin.</p>
          </div>
          {!user && (
            <Link to="/connexion" className="btn-secondaire btn-large">
              Se connecter
            </Link>
          )}
        </div>
      </aside>

      <div className="app-colonne">
        <BandeHorsConnexion />
        <header className="en-tete">
          <Link to="/" aria-label="Accueil Laafi Rose">
            <Logo />
          </Link>
          <div className="en-tete-actions">
            {liensPro.length > 0 && (
              <Link to="/pro" className="en-tete-bouton en-tete-pro" aria-label="Espace professionnel">
                <BriefcaseMedical size={20} />
              </Link>
            )}
            <Link to="/notifications" className="en-tete-bouton" aria-label="Notifications">
              <Bell size={20} />
            </Link>
            <Link to="/profil" className="en-tete-bouton" aria-label="Profil et préférences">
              <UserRound size={20} />
            </Link>
          </div>
        </header>

        <main className="app-contenu">
          <Outlet />
        </main>
      </div>

      <nav className="barre-nav" aria-label="Navigation principale">
        {onglets.map(({ vers, libelle, Icone, exact }) => (
          <NavLink key={vers} to={vers} end={exact} className={({ isActive }) => (isActive ? "onglet actif" : "onglet")}>
            <span className="onglet-pastille">
              <Icone size={22} />
            </span>
            <span className="onglet-libelle">{libelle}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
