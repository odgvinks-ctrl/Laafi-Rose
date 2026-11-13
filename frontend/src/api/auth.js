import { API, requete, ecrireJeton } from "./http.js";

export function numeroComplet(telephone) {
  const chiffres = String(telephone).replace(/\s+/g, "");
  return chiffres.startsWith("+") ? chiffres : `+226${chiffres}`;
}

export async function connecter(telephone, motDePasse) {
  const reponse = await requete(API, "/auth/login", {
    methode: "POST",
    corps: { phone: numeroComplet(telephone), password: motDePasse },
    auth: false,
  });
  ecrireJeton(reponse.access_token);
  return chargerMoi();
}

export async function inscrire({ telephone, motDePasse, prenom, ville, langue }) {
  const reponse = await requete(API, "/auth/register", {
    methode: "POST",
    corps: {
      phone: numeroComplet(telephone),
      password: motDePasse,
      first_name: prenom,
      city: ville || null,
      language: langue,
    },
    auth: false,
  });
  ecrireJeton(reponse.access_token);
  return chargerMoi();
}

export function chargerMoi() {
  return requete(API, "/users/me");
}

export function modifierProfil(champs) {
  return requete(API, "/users/me/profile", { methode: "PATCH", corps: champs });
}

export function deconnecter() {
  ecrireJeton(null);
}
