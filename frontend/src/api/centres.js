import { API, requete } from "./http.js";

export function listerCentres({ recherche, verifies, position } = {}) {
  return requete(API, "/health-centers/", {
    auth: false,
    params: {
      q: recherche,
      verified: verifies ? "true" : undefined,
      lat: position?.latitude,
      lng: position?.longitude,
    },
  });
}

export function obtenirCentre(id) {
  return requete(API, `/health-centers/${id}`, { auth: false });
}
