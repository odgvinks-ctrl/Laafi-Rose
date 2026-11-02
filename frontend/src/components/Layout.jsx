import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import EnTete from "./EnTete.jsx";
import BarreNavigation from "./BarreNavigation.jsx";
import BandeHorsConnexion from "./BandeHorsConnexion.jsx";
import "./Layout.css";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <BandeHorsConnexion />
      <EnTete />
      <main className="app-contenu">
        <Outlet />
      </main>
      <BarreNavigation />
    </div>
  );
}
