const racine = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const CLE_JETON = "laafi-jeton";

export const modeDemo = !racine;

export function lireJeton() {
  try {
    return localStorage.getItem(CLE_JETON);
  } catch {
    return null;
  }
}

export function ecrireJeton(jeton) {
  try {
    if (jeton) {
      localStorage.setItem(CLE_JETON, jeton);
    } else {
      localStorage.removeItem(CLE_JETON);
    }
  } catch {
    return;
  }
}

function messageErreur(statut, corps) {
  const detail = corps && corps.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) return "Certaines informations sont invalides.";
  if (statut >= 500) return "Le service rencontre un problème. Réessayez dans un instant.";
  return "Une erreur est survenue.";
}

export async function requete(chemin, { methode = "GET", corps, auth = true } = {}) {
  if (!navigator.onLine) {
    throw new Error("Vous êtes hors connexion. Cette action sera possible au retour du réseau.");
  }

  const entetes = {};
  if (corps !== undefined) entetes["Content-Type"] = "application/json";
  const jeton = lireJeton();
  if (auth && jeton) entetes.Authorization = `Bearer ${jeton}`;

  let reponse;
  try {
    reponse = await fetch(racine + chemin, {
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
    throw new Error(messageErreur(reponse.status, donnees));
  }
  return donnees;
}
