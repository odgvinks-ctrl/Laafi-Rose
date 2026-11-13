import { IA, requete } from "./http.js";

export async function demarrerConversation(langue) {
  const session = await requete(IA, "/chat/sessions", { methode: "POST", corps: { language: langue } });
  return session.id;
}

export function poserQuestion(sessionId, question) {
  return requete(IA, `/chat/sessions/${sessionId}/messages`, { methode: "POST", corps: { content: question } });
}
