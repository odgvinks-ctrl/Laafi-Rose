import { API, requete } from "./http.js";
import { numeroComplet } from "./auth.js";

export function creerCentre(centre) {
  return requete(API, "/health-centers/", { methode: "POST", corps: centre });
}

export function listerComptes(role) {
  return requete(API, "/users/", { params: { role } });
}

export function creerCompte({ telephone, motDePasse, prenom, nom, role, centreId }) {
  return requete(API, "/users/", {
    methode: "POST",
    corps: {
      phone: numeroComplet(telephone),
      password: motDePasse,
      first_name: prenom.trim(),
      last_name: nom.trim() || null,
      role,
      health_center_id: centreId ? Number(centreId) : null,
    },
  });
}

export function desactiverCompte(id) {
  return requete(API, `/users/${id}/desactiver`, { methode: "PATCH" });
}
