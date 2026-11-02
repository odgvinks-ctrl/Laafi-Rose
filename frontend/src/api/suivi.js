import { requete } from "./http.js";

export async function getMonSuivi() {
  return requete("/suivi/moi");
}

export async function envoyerEtatDuJour(reponses) {
  return requete("/suivi/etat-du-jour", { methode: "POST", corps: reponses });
}
