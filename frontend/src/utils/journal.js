import { lire, ecrire } from "./stockage.js";

const CLE = "laafi-journal";

export function lireJournal() {
  return lire(CLE, []).sort((a, b) => b.date.localeCompare(a.date));
}

export function ajouterEntree(entree) {
  const nouvelle = { ...entree, id: Date.now(), date: new Date().toISOString() };
  ecrire(CLE, [nouvelle, ...lire(CLE, [])]);
  return nouvelle;
}

export function supprimerEntree(id) {
  ecrire(CLE, lire(CLE, []).filter((e) => e.id !== id));
}

export function signeInquietant(entree) {
  return entree.fievre || entree.saignement || entree.douleur >= 7;
}
