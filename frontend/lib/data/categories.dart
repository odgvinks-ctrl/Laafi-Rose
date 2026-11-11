// Les rubriques des fiches d'information.
// La clé (à gauche) est le code envoyé par l'ai-service,
// la valeur (à droite) est le texte affiché à l'écran.
const categoriesArticles = {
  'cancer': 'Les cancers',
  'prevention': 'Prévention',
  'depistage': 'Dépistage',
  'facteurs': 'Facteurs de risque',
};

// Petite fonction pratique : donne le libellé d'une catégorie.
// Si le code est inconnu, on affiche le code tel quel.
String libelleCategorie(String code) => categoriesArticles[code] ?? code;
