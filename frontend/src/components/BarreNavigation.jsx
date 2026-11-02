import { NavLink } from "react-router-dom";
import { House, BookOpen, MapPin, MessageCircle, Download } from "lucide-react";
import "./BarreNavigation.css";

const onglets = [
  { vers: "/", libelle: "Accueil", Icone: House, exact: true },
  { vers: "/sinformer", libelle: "S'informer", Icone: BookOpen },
  { vers: "/centres", libelle: "Centres", Icone: MapPin },
  { vers: "/assistant", libelle: "Assistant", Icone: MessageCircle },
  { vers: "/enregistres", libelle: "Enregistrés", Icone: Download },
];

export default function BarreNavigation() {
  return (
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
  );
}
