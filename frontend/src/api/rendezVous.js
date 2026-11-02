import { requete } from "./http.js";

export async function demanderRendezVous(demande) {
  return requete("/rendez-vous/", { methode: "POST", corps: demande, auth: false });
}

export async function getStatutDemande(reference) {
  return requete(`/rendez-vous/${reference}`, { auth: false });
}
