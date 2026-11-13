import { useState } from "react";

export function useGeolocalisation() {
  const [position, setPosition] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  function demander() {
    setErreur("");
    return new Promise((resoudre) => {
      if (!navigator.geolocation) {
        setErreur("La localisation n'est pas disponible sur cet appareil.");
        resoudre(null);
        return;
      }
      setEnCours(true);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const coords = { latitude: p.coords.latitude, longitude: p.coords.longitude };
          setPosition(coords);
          setEnCours(false);
          resoudre(coords);
        },
        () => {
          setErreur("Sans la localisation, les centres restent classés par nom.");
          setEnCours(false);
          resoudre(null);
        },
        { enableHighAccuracy: false, timeout: 10000 },
      );
    });
  }

  return { position, enCours, erreur, demander };
}
