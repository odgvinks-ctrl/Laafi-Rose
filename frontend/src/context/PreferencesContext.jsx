import { createContext, useContext, useEffect, useState } from "react";
import { lire, ecrire } from "../utils/stockage.js";

const PreferencesContext = createContext(null);
const CLE = "laafi-preferences";
const tailles = { standard: "16px", grand: "18px", "tres-grand": "20px" };

const parDefaut = {
  langueAudio: "fr",
  tailleTexte: "standard",
  wifiSeulement: true,
  introVue: false,
};

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => ({ ...parDefaut, ...lire(CLE, {}) }));

  useEffect(() => {
    ecrire(CLE, preferences);
    document.documentElement.style.setProperty("--taille-texte", tailles[preferences.tailleTexte]);
  }, [preferences]);

  function modifier(cle, valeur) {
    setPreferences((actuel) => ({ ...actuel, [cle]: valeur }));
  }

  return (
    <PreferencesContext.Provider value={{ preferences, modifier }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
