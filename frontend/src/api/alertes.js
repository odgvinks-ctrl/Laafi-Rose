import { requete } from "./http.js";

export async function lancerAlerte({ type, symptome, latitude, longitude }) {
  return requete("/alertes/", {
    methode: "POST",
    corps: { type, symptome, latitude, longitude },
  });
}

export async function getAlerte(id) {
  return requete(`/alertes/${id}`);
}
