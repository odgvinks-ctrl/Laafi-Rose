import { requete } from "./http.js";

export async function getMarraines() {
  return requete("/marraines/", { auth: false });
}

export async function demanderMarraine(demande) {
  return requete("/marraines/demandes", { methode: "POST", corps: demande, auth: false });
}
