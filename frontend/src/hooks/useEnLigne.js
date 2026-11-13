import { useEffect, useState } from "react";

export function useEnLigne() {
  const [enLigne, setEnLigne] = useState(navigator.onLine);

  useEffect(() => {
    const allumer = () => setEnLigne(true);
    const eteindre = () => setEnLigne(false);
    window.addEventListener("online", allumer);
    window.addEventListener("offline", eteindre);
    return () => {
      window.removeEventListener("online", allumer);
      window.removeEventListener("offline", eteindre);
    };
  }, []);

  return enLigne;
}
