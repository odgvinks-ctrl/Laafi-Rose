import { useState } from "react";
import { lire, ecrire } from "../utils/stockage.js";

const CLE = "laafi-enregistres";

export function useEnregistres() {
  const [elements, setElements] = useState(() => lire(CLE, []));

  function mettreAJour(liste) {
    setElements(liste);
    ecrire(CLE, liste);
  }

  function ajouter(element) {
    if (elements.some((e) => e.id === element.id)) return;
    mettreAJour([...elements, element]);
  }

  function retirer(id) {
    mettreAJour(elements.filter((e) => e.id !== id));
  }

  function estEnregistre(id) {
    return elements.some((e) => e.id === id);
  }

  return { elements, ajouter, retirer, estEnregistre };
}
