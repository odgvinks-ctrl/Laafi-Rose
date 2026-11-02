import { useEffect, useState } from "react";

export function useEnLigne() {
  const [enLigne, setEnLigne] = useState(navigator.onLine);

  useEffect(() => {
    const enLigneOn = () => setEnLigne(true);
    const enLigneOff = () => setEnLigne(false);
    window.addEventListener("online", enLigneOn);
    window.addEventListener("offline", enLigneOff);
    return () => {
      window.removeEventListener("online", enLigneOn);
      window.removeEventListener("offline", enLigneOff);
    };
  }, []);

  return enLigne;
}
