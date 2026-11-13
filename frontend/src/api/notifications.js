import { API, requete } from "./http.js";

export function listerNotifications() {
  return requete(API, "/notifications/");
}

export function marquerLue(id) {
  return requete(API, `/notifications/${id}/lue`, { methode: "POST" });
}

export function toutMarquerLu() {
  return requete(API, "/notifications/tout-lire", { methode: "POST" });
}
