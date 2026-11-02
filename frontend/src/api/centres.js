import { requete, modeDemo } from "./http.js";
import { centres } from "../data/centres.js";

function centreDepuisApi(c) {
  return {
    id: c.id,
    nom: c.name,
    type: c.type,
    ville: c.city,
    quartier: c.district,
    adresse: c.address,
    telephone: c.phone,
    latitude: c.latitude,
    longitude: c.longitude,
    services: c.services,
    horaires: c.hours,
    rendezVous: c.accepts_appointments,
    verifie: c.verified,
    verifieLe: c.verified_at,
    distance: c.distance_km,
  };
}

export async function getCentres({ ville, service, verifies, recherche, lat, lng } = {}) {
  if (modeDemo) return centres;
  const params = new URLSearchParams();
  if (ville) params.set("ville", ville);
  if (service) params.set("service", service);
  if (verifies) params.set("verifies", "true");
  if (recherche) params.set("q", recherche);
  if (lat && lng) {
    params.set("lat", lat);
    params.set("lng", lng);
  }
  const liste = await requete(`/centres/?${params}`, { auth: false });
  return liste.map(centreDepuisApi);
}

export async function getCentre(id) {
  if (modeDemo) return centres.find((c) => String(c.id) === String(id)) || null;
  return centreDepuisApi(await requete(`/centres/${id}`, { auth: false }));
}

export async function getCreneaux(id) {
  return requete(`/centres/${id}/creneaux`, { auth: false });
}

export async function signalerErreur(id, message) {
  return requete(`/centres/${id}/signalements`, { methode: "POST", corps: { message }, auth: false });
}
