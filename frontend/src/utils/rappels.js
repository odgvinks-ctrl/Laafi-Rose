import { lire, ecrire } from "./stockage.js";
import { typeRappel } from "../data/typesRappels.js";

const CLE = "laafi-rappels";
const CLE_NOTIFIES = "laafi-rappels-notifies";

export function aujourdHui() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dateLocale(texte) {
  const [annee, mois, jour] = texte.split("-").map(Number);
  return new Date(annee, mois - 1, jour);
}

function versTexte(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function decaler(texte, recurrence) {
  const date = dateLocale(texte);
  if (recurrence === "mensuelle") date.setMonth(date.getMonth() + 1);
  if (recurrence === "annuelle") date.setFullYear(date.getFullYear() + 1);
  return versTexte(date);
}

export function titreRappel(rappel) {
  return rappel.titre || typeRappel(rappel.type).nom;
}

export function lireRappels() {
  return lire(CLE, []).sort((a, b) => `${a.date}${a.heure}`.localeCompare(`${b.date}${b.heure}`));
}

function enregistrer(liste) {
  ecrire(CLE, liste);
  return lireRappels();
}

export function ajouterRappel(rappel) {
  return enregistrer([...lire(CLE, []), { ...rappel, id: Date.now(), fait: false, historique: [] }]);
}

export function supprimerRappel(id) {
  return enregistrer(lire(CLE, []).filter((r) => r.id !== id));
}

export function marquerFait(id) {
  const liste = lire(CLE, []).map((r) => {
    if (r.id !== id) return r;
    const historique = [...(r.historique || []), aujourdHui()];
    if (r.recurrence === "aucune") return { ...r, fait: true, historique };
    let prochaine = decaler(r.date, r.recurrence);
    while (prochaine <= aujourdHui()) prochaine = decaler(prochaine, r.recurrence);
    return { ...r, date: prochaine, historique };
  });
  return enregistrer(liste);
}

export function rappelsEchus(liste = lireRappels()) {
  const jour = aujourdHui();
  return liste.filter((r) => !r.fait && r.date <= jour);
}

export function rappelsAVenir(liste = lireRappels()) {
  const jour = aujourdHui();
  return liste.filter((r) => !r.fait && r.date > jour);
}

export function rappelExiste(type) {
  return lire(CLE, []).some((r) => r.type === type && !r.fait);
}

export function notificationsPossibles() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function autoriserNotifications() {
  if (!notificationsPossibles()) return "indisponible";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}

export function notifierRappelsEchus() {
  if (!notificationsPossibles() || Notification.permission !== "granted") return;
  const jour = aujourdHui();
  const dejaFaits = lire(CLE_NOTIFIES, {});
  rappelsEchus().forEach((r) => {
    if (dejaFaits[r.id] === jour) return;
    try {
      new Notification("Laafi Rose · Rappel", { body: titreRappel(r), icon: "/icone-192.png", tag: `rappel-${r.id}` });
      dejaFaits[r.id] = jour;
    } catch {
      return;
    }
  });
  ecrire(CLE_NOTIFIES, dejaFaits);
}
