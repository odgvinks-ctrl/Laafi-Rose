import { titreRappel } from "./rappels.js";

const regles = { mensuelle: "RRULE:FREQ=MONTHLY", annuelle: "RRULE:FREQ=YEARLY" };

function echapper(texte) {
  return String(texte || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function horodatage(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function contenuIcs(rappel) {
  const [heures, minutes] = (rappel.heure || "09:00").split(":");
  const debut = `${rappel.date.replace(/-/g, "")}T${heures}${minutes}00`;
  const lignes = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Laafi Rose//Rappels//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:laafi-rose-${rappel.id}@laafirose`,
    `DTSTAMP:${horodatage(new Date())}`,
    `DTSTART:${debut}`,
    "DURATION:PT30M",
    `SUMMARY:${echapper(`Laafi Rose · ${titreRappel(rappel)}`)}`,
    `DESCRIPTION:${echapper(rappel.note || "Rappel créé dans l'application Laafi Rose.")}`,
    regles[rappel.recurrence],
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${echapper(titreRappel(rappel))}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lignes.join("\r\n");
}

export function ajouterAuCalendrier(rappel) {
  const blob = new Blob([contenuIcs(rappel)], { type: "text/calendar;charset=utf-8" });
  const lien = document.createElement("a");
  lien.href = URL.createObjectURL(blob);
  lien.download = `laafi-rose-${rappel.type}.ics`;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(lien.href), 1000);
}
