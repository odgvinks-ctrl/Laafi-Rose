import { requete, modeDemo } from "./http.js";
import { fiches } from "../data/fiches.js";

function ficheDepuisApi(f) {
  const audios = { fr: false, mo: false, dy: false };
  (f.audios || []).forEach((a) => {
    if (a.status === "disponible") audios[a.language] = true;
  });
  return {
    slug: f.slug,
    categorie: f.category,
    titre: f.title,
    resume: f.summary,
    contenu: f.content,
    sources: (f.sources || "").split("|").filter(Boolean),
    lecture: f.reading_minutes,
    revisee: f.reviewed_at,
    audios,
    listeAudios: f.audios || [],
  };
}

export async function getFiches(categorie = "cancer") {
  if (modeDemo) return fiches;
  const liste = await requete(`/fiches/?category=${categorie}`, { auth: false });
  return liste.map(ficheDepuisApi);
}

export async function getFiche(slug) {
  if (modeDemo) return fiches.find((f) => f.slug === slug) || null;
  return ficheDepuisApi(await requete(`/fiches/${slug}`, { auth: false }));
}

export async function getFacteurs() {
  return getFiches("facteur");
}

export async function getDepistages() {
  return getFiches("depistage");
}
