export const langues = [
  { code: "fr", nom: "Français" },
  { code: "mo", nom: "Mooré" },
  { code: "dy", nom: "Dioula" },
];

export function nomLangue(code) {
  return langues.find((l) => l.code === code)?.nom || code;
}
