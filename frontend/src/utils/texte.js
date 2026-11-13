export function sansAccents(texte) {
  return String(texte || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function formaterDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function dateCourte(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ilYA(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  return dateCourte(iso);
}

export function duree(secondes) {
  const s = Math.max(0, Math.floor(secondes || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function taille(octets) {
  if (!octets) return "0 Mo";
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

export function prenomCourt(utilisateur) {
  return utilisateur?.profile?.first_name || "";
}
