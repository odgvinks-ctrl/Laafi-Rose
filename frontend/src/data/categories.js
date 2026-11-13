export const categories = [
  { code: "cancer", nom: "Les cancers" },
  { code: "prevention", nom: "Prévention" },
  { code: "depistage", nom: "Dépistage" },
  { code: "facteurs", nom: "Facteurs de risque" },
];

export function nomCategorie(code) {
  return categories.find((c) => c.code === code)?.nom || code;
}
