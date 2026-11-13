import { lire, ecrire } from "./stockage.js";

const NOM_CACHE = "laafi-audios";
const CLE_LISTE = "laafi-audios-liste";

export function cacheDisponible() {
  return typeof window !== "undefined" && "caches" in window;
}

export function audiosEnregistres() {
  return lire(CLE_LISTE, []);
}

export function audioEnregistre(slug, langue) {
  return audiosEnregistres().find((a) => a.slug === slug && a.langue === langue) || null;
}

export async function telechargerAudio({ slug, titre, langue, url }) {
  if (!cacheDisponible()) throw new Error("Votre navigateur ne permet pas d'enregistrer l'audio.");

  let reponse;
  try {
    reponse = await fetch(url);
  } catch {
    throw new Error("Le téléchargement a échoué. Vérifiez votre connexion.");
  }
  if (!reponse.ok) throw new Error("Cet audio n'est pas disponible pour le moment.");

  const contenu = await reponse.blob();
  const boite = await caches.open(NOM_CACHE);
  await boite.put(url, new Response(contenu, { headers: { "Content-Type": contenu.type || "audio/mpeg" } }));

  const element = { slug, titre, langue, url, taille: contenu.size, le: new Date().toISOString() };
  ecrire(CLE_LISTE, [...audiosEnregistres().filter((a) => !(a.slug === slug && a.langue === langue)), element]);
  return element;
}

export async function sourceAudio(url) {
  if (!cacheDisponible()) return url;
  try {
    const boite = await caches.open(NOM_CACHE);
    const trouve = await boite.match(url);
    if (!trouve) return url;
    return URL.createObjectURL(await trouve.blob());
  } catch {
    return url;
  }
}

export async function supprimerAudio(element) {
  if (cacheDisponible()) {
    const boite = await caches.open(NOM_CACHE);
    await boite.delete(element.url);
  }
  ecrire(CLE_LISTE, audiosEnregistres().filter((a) => !(a.slug === element.slug && a.langue === element.langue)));
}

export function espaceUtilise() {
  return audiosEnregistres().reduce((total, a) => total + (a.taille || 0), 0);
}
