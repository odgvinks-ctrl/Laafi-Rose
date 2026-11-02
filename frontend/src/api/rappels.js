import { requete } from "./http.js";

export async function abonnerRappel(rappel) {
  return requete("/rappels/", { methode: "POST", corps: rappel, auth: false });
}
