import { requete } from "./http.js";

export async function poserQuestion(question, langue) {
  return requete("/assistant/", { methode: "POST", corps: { question, langue }, auth: false });
}
