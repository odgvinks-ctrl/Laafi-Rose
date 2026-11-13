import { IA, requete } from "./http.js";
import { lire, ecrire } from "../utils/stockage.js";

const CLE_ARTICLES = "laafi-articles";
const CLE_ENREGISTRES = "laafi-articles-enregistres";

function cache() {
  return lire(CLE_ARTICLES, {});
}

function trier(liste) {
  return [...liste].sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
}

export function articlesEnCache() {
  return trier(Object.values(cache()));
}

export function articleEnCache(slug) {
  return cache()[slug] || null;
}

export async function synchroniserArticles() {
  const actuel = cache();
  const dates = Object.values(actuel).map((a) => a.mis_a_jour_le).filter(Boolean).sort();
  const depuis = dates.length ? dates[dates.length - 1] : undefined;

  const nouveaux = await requete(IA, "/articles/", { auth: false, params: { depuis } });
  nouveaux.forEach((article) => {
    actuel[article.slug] = article;
  });

  const retires = await requete(IA, "/articles/retires", { auth: false });
  retires.forEach((slug) => {
    delete actuel[slug];
  });

  ecrire(CLE_ARTICLES, actuel);
  return trier(Object.values(actuel));
}

export async function obtenirArticle(slug) {
  const local = articleEnCache(slug);
  if (local) return local;

  const article = await requete(IA, `/articles/${slug}`, { auth: false });
  const actuel = cache();
  actuel[slug] = article;
  ecrire(CLE_ARTICLES, actuel);
  return article;
}

export function slugsEnregistres() {
  return lire(CLE_ENREGISTRES, []);
}

export function estEnregistre(slug) {
  return slugsEnregistres().includes(slug);
}

export function basculerEnregistrement(slug) {
  const liste = slugsEnregistres();
  const nouvelle = liste.includes(slug) ? liste.filter((s) => s !== slug) : [...liste, slug];
  ecrire(CLE_ENREGISTRES, nouvelle);
  return nouvelle.includes(slug);
}

export function articlesEnregistres() {
  const tous = cache();
  return trier(slugsEnregistres().map((slug) => tous[slug]).filter(Boolean));
}
