export const typesRappels = [
  {
    code: "autopalpation",
    nom: "Autopalpation des seins",
    recurrence: "mensuelle",
    conseil: "Une fois par mois, quelques jours après la fin des règles. Après la ménopause, choisissez un jour fixe chaque mois.",
  },
  {
    code: "vaccin_hpv",
    nom: "Vaccin contre le HPV",
    recurrence: "aucune",
    conseil: "Recommandé aux filles de 9 à 14 ans pour prévenir le cancer du col. Le nombre de doses et leur date sont indiqués par l'agent de santé.",
  },
  {
    code: "depistage_col",
    nom: "Dépistage du cancer du col",
    recurrence: "aucune",
    conseil: "L'OMS recommande un dépistage régulier à partir de 30 ans. Le soignant vous dira quand revenir après votre examen.",
  },
  {
    code: "examen_seins",
    nom: "Examen des seins par un soignant",
    recurrence: "annuelle",
    conseil: "Un examen clinique régulier complète l'autopalpation. Demandez au centre de santé à quelle fréquence le faire.",
  },
  {
    code: "rendez_vous",
    nom: "Rendez-vous médical",
    recurrence: "aucune",
    conseil: "Notez la date et l'heure données par le centre.",
  },
  {
    code: "autre",
    nom: "Autre rappel",
    recurrence: "aucune",
    conseil: "",
  },
];

export const recurrences = [
  { code: "aucune", nom: "Une seule fois" },
  { code: "mensuelle", nom: "Tous les mois" },
  { code: "annuelle", nom: "Tous les ans" },
];

export function typeRappel(code) {
  return typesRappels.find((t) => t.code === code) || typesRappels[typesRappels.length - 1];
}
