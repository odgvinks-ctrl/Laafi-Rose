import { lire, ecrire } from "../utils/stockage.js";

const CLE_JETON = "laafi-jeton";

export const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
export const IA = (import.meta.env.VITE_IA_URL || "/ia").replace(/\/+$/, "");

export function lireJeton() {
  return lire(CLE_JETON, null);
}

export function ecrireJeton(jeton) {
  ecrire(CLE_JETON, jeton || null);
}

function messageErreur(statut, corps) {
  const detail = corps && corps.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) return "Certaines informations ne sont pas valides.";
  if (statut === 404) return "Élément introuvable.";
  if (statut >= 500) return "Le service rencontre un problème. Réessayez dans un instant.";
  return "Une erreur est survenue.";
}

export async function requete(base, chemin, { methode = "GET", corps, params, auth = true } = {}) {
  if (!navigator.onLine) {
    throw new Error("Vous êtes hors connexion. Cette action sera possible au retour du réseau.");
  }

  let url = base + chemin;
  if (params) {
    const recherche = new URLSearchParams();
    Object.entries(params).forEach(([cle, valeur]) => {
      if (valeur !== undefined && valeur !== null && valeur !== "") recherche.set(cle, valeur);
    });
    const texte = recherche.toString();
    if (texte) url += `?${texte}`;
  }

  const entetes = {};
  if (corps !== undefined) entetes["Content-Type"] = "application/json";
  const jeton = lireJeton();
  if (auth && jeton) entetes.Authorization = `Bearer ${jeton}`;

  let reponse;
  try {
    reponse = await fetch(url, {
      method: methode,
      headers: entetes,
      body: corps !== undefined ? JSON.stringify(corps) : undefined,
    });
  } catch {
    throw new Error("Impossible de joindre le service. Vérifiez votre connexion.");
  }

  if (reponse.status === 204) return null;

  let donnees;
  try {
    donnees = await reponse.json();
  } catch {
    donnees = null;
  }

  if (!reponse.ok) {
    if (reponse.status === 401 && auth && jeton) {
      ecrireJeton(null);
      window.dispatchEvent(new Event("laafi-session-expiree"));
    }
    if (reponse.status === 502 || reponse.status === 503 || reponse.status === 504) {
      throw new Error("Le service est injoignable pour le moment. Réessayez plus tard.");
    }
    throw new Error(messageErreur(reponse.status, donnees));
  }
  return donnees;
}
