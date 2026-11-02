import { requete } from "./http.js";

export async function getAudios() {
  return requete("/audios/", { auth: false });
}

export async function getAudio(id) {
  return requete(`/audios/${id}`, { auth: false });
}
