import { createContext, useContext, useEffect, useState } from "react";
import { chargerMoi, deconnecter, sessionActive } from "../api/auth.js";

const AuthContext = createContext(null);
const CLE = "laafi-utilisateur";

function lireUtilisateur() {
  try {
    const stocke = JSON.parse(localStorage.getItem(CLE));
    return stocke && sessionActive() ? stocke : null;
  } catch {
    return null;
  }
}

function stocker(utilisateur) {
  try {
    if (utilisateur) {
      localStorage.setItem(CLE, JSON.stringify(utilisateur));
    } else {
      localStorage.removeItem(CLE);
    }
  } catch {
    return;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(lireUtilisateur);
  const id = user?.id;

  useEffect(() => {
    if (!id) return;

    function appliquer(compte) {
      setUser(compte);
      stocker(compte);
    }

    const actualiser = () => chargerMoi().then(appliquer, () => {});
    const expirer = () => appliquer(null);
    actualiser();
    window.addEventListener("laafi-session-expiree", expirer);
    return () => window.removeEventListener("laafi-session-expiree", expirer);
  }, [id]);

  function enregistrer(utilisateur) {
    setUser(utilisateur);
    stocker(utilisateur);
  }

  function logout() {
    deconnecter();
    setUser(null);
    stocker(null);
  }

  return (
    <AuthContext.Provider value={{ user, enregistrer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
