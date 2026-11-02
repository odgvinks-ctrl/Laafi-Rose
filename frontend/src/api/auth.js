import { requete, ecrireJeton, lireJeton } from "./http.js";

export function sessionActive() {
  return Boolean(lireJeton());
}

export function deconnecter() {
  ecrireJeton(null);
}

export async function chargerMoi() {
  return requete("/users/me");
}

export async function login({ telephone, password }) {
  const reponse = await requete("/auth/login", {
    methode: "POST",
    corps: { phone: telephone.trim(), password },
    auth: false,
  });
  ecrireJeton(reponse.access_token);
  return chargerMoi();
}
