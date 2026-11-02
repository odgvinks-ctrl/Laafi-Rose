import { requete } from "./http.js";

export async function getTableauDeBord() {
  return requete("/soignant/tableau-de-bord");
}

export async function getAlertesSoignant(statut) {
  return requete(`/alertes/${statut ? `?statut=${statut}` : ""}`);
}

export async function prendreEnCharge(id) {
  return requete(`/alertes/${id}/prise-en-charge`, { methode: "POST" });
}

export async function getPatients() {
  return requete("/patients/");
}

export async function getPatient(id) {
  return requete(`/patients/${id}`);
}

export async function inscrirePatient(patient) {
  return requete("/patients/", { methode: "POST", corps: patient });
}

export async function ajouterSeance(patientId, seance) {
  return requete(`/patients/${patientId}/seances`, { methode: "POST", corps: seance });
}
