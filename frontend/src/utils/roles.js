const anciensCodes = { utilisateur: "patient", soignant: "medecin" };

export function roleDe(user) {
  if (!user) return null;
  const code = typeof user.role === "string" ? user.role : user.role?.code;
  return anciensCodes[code] || code || null;
}

export function estPro(user) {
  return ["medecin", "centre", "admin"].includes(roleDe(user));
}

export function estAdmin(user) {
  return roleDe(user) === "admin";
}

export function peutGererCentre(user) {
  return ["centre", "admin"].includes(roleDe(user));
}

export const libellesRoles = {
  patient: "Utilisatrice",
  medecin: "Soignant",
  centre: "Accueil du centre",
  admin: "Administrateur",
};
