import { API, requete } from "./http.js";

export function demandesDuCentre(centreId, statut) {
  return requete(API, `/appointments/centre/${centreId}`, { params: { status_filter: statut } });
}

export function changerStatut(reference, { statut, confirmeLe, note }) {
  const corps = { status: statut };
  if (confirmeLe) corps.confirmed_at = confirmeLe;
  if (note) corps.staff_note = note;
  return requete(API, `/appointments/${reference}`, { methode: "PATCH", corps });
}

export function modifierCentre(centreId, champs) {
  return requete(API, `/health-centers/${centreId}`, { methode: "PATCH", corps: champs });
}

export function ajouterService(centreId, service) {
  return requete(API, `/health-centers/${centreId}/services`, { methode: "POST", corps: service });
}

export function modifierService(serviceId, champs) {
  return requete(API, `/services/${serviceId}`, { methode: "PATCH", corps: champs });
}

export function supprimerService(serviceId) {
  return requete(API, `/services/${serviceId}`, { methode: "DELETE" });
}

export function categoriesServices() {
  return requete(API, "/services/categories", { auth: false });
}
