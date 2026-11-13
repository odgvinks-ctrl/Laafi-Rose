import { API, requete } from "./http.js";
import { numeroComplet } from "./auth.js";

export function demanderRendezVous({ centreId, serviceId, date, nom, telephone, contact, langue }) {
  return requete(API, "/appointments/", {
    methode: "POST",
    corps: {
      health_center_id: Number(centreId),
      service_id: serviceId || null,
      desired_at: date ? `${date}T08:00:00` : null,
      name: nom.trim(),
      phone: numeroComplet(telephone),
      contact_method: contact,
      language: langue,
      consent: true,
    },
  });
}

export function mesDemandes() {
  return requete(API, "/appointments/mes-demandes");
}

export function suivreDemande(reference, telephone) {
  return requete(API, `/appointments/${reference}`, { auth: false, params: { phone: numeroComplet(telephone) } });
}
