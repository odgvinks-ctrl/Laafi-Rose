import { useEffect, useState } from "react";
import { articlesEnCache, synchroniserArticles } from "../api/articles.js";

export function useArticles() {
  const [articles, setArticles] = useState(articlesEnCache);
  const [synchro, setSynchro] = useState(() => navigator.onLine);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (!navigator.onLine) return;
    let actif = true;
    synchroniserArticles()
      .then(
        (liste) => actif && setArticles(liste),
        (e) => actif && setErreur(e.message),
      )
      .finally(() => actif && setSynchro(false));
    return () => {
      actif = false;
    };
  }, []);

  async function actualiser() {
    if (!navigator.onLine) {
      setErreur("Vous êtes hors connexion.");
      return;
    }
    setSynchro(true);
    setErreur("");
    try {
      setArticles(await synchroniserArticles());
    } catch (e) {
      setErreur(e.message);
    } finally {
      setSynchro(false);
    }
  }

  return { articles, synchro, erreur, actualiser };
}
