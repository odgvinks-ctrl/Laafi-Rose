export const categoriesServices = [
  { code: "depistage_sein", nom: "Dépistage du cancer du sein" },
  { code: "depistage_col", nom: "Dépistage du cancer du col" },
  { code: "depistage_hepatites", nom: "Dépistage des hépatites" },
  { code: "vaccination", nom: "Vaccination (HPV, hépatite B…)" },
  { code: "consultation", nom: "Consultation" },
  { code: "information", nom: "Information et orientation" },
  { code: "autre", nom: "Autre" },
];

export function nomCategorieService(code) {
  return categoriesServices.find((c) => c.code === code)?.nom || code;
}
