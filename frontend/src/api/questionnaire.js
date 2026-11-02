import { requete, modeDemo } from "./http.js";
import { questions } from "../data/questionnaire.js";

export async function getQuestions() {
  if (modeDemo) return questions;
  return requete("/questionnaire/", { auth: false });
}
