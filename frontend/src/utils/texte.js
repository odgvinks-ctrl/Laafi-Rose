export function sansAccents(texte) {
  return String(texte || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function formaterDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function heure(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function duree(secondes) {
  const s = Math.max(0, Math.floor(secondes));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function taille(mo) {
  return `${mo.toFixed(1).replace(".", ",")} Mo`;
}
