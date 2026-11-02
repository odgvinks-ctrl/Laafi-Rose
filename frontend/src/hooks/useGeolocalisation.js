import { useState } from "react";

export function useGeolocalisation() {
  const [position, setPosition] = useState(null);
  const [erreur, setErreur] = useState("");

  function demander() {
    return new Promise((resoudre) => {
      if (!navigator.geolocation) {
        setErreur("La localisation n'est pas disponible sur ce téléphone.");
        resoudre(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const coords = { latitude: p.coords.latitude, longitude: p.coords.longitude };
          setPosition(coords);
          resoudre(coords);
        },
        () => {
          setErreur("Localisation désactivée.");
          resoudre(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  return { position, erreur, demander };
}
