import { createContext, useContext, useEffect, useState } from "react";
import { chargerMoi, deconnecter } from "../api/auth.js";
import { lireJeton } from "../api/http.js";
import { lire, ecrire } from "../utils/stockage.js";

const AuthContext = createContext(null);
const CLE = "laafi-utilisateur";

function utilisateurInitial() {
  return lireJeton() ? lire(CLE, null) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(utilisateurInitial);
  const id = user?.id;

  useEffect(() => {
    function expirer() {
      setUser(null);
      ecrire(CLE, null);
    }

    window.addEventListener("laafi-session-expiree", expirer);
    return () => window.removeEventListener("laafi-session-expiree", expirer);
  }, []);

  useEffect(() => {
    if (!id || !navigator.onLine) return;
    chargerMoi().then(
      (compte) => {
        setUser(compte);
        ecrire(CLE, compte);
      },
      () => {},
    );
  }, [id]);

  function enregistrer(compte) {
    setUser(compte);
    ecrire(CLE, compte);
  }

  function logout() {
    deconnecter();
    setUser(null);
    ecrire(CLE, null);
  }

  return <AuthContext.Provider value={{ user, enregistrer, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
