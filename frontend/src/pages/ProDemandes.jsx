import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Phone, MessageSquare, RefreshCw, CalendarCheck, CalendarX, UserCheck, UserX, Inbox, Building2 } from "lucide-react";
import AccesReserve from "../components/AccesReserve.jsx";
import EtatVide from "../components/EtatVide.jsx";
import Encadre from "../components/Encadre.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { listerCentres, obtenirCentre } from "../api/centres.js";
import { changerStatut, demandesDuCentre } from "../api/pro.js";
import { nomLangue } from "../data/langues.js";
import { estAdmin } from "../utils/roles.js";
import { formaterDate, ilYA } from "../utils/texte.js";
import "./ProDemandes.css";

const onglets = [
  { code: "attente", libelle: "À traiter", statuts: ["en_attente"] },
  { code: "confirmes", libelle: "Confirmés", statuts: ["confirme"] },
  { code: "historique", libelle: "Historique", statuts: ["honore", "absent", "annule"] },
];

const statuts = {
  en_attente: { texte: "En attente", classe: "badge-ambre" },
  confirme: { texte: "Confirmé", classe: "badge-vert" },
  honore: { texte: "Venue", classe: "badge-neutre" },
  absent: { texte: "Absente", classe: "badge-rouge" },
  annule: { texte: "Annulé", classe: "badge-rouge" },
};

function dateHeure(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

function CarteDemande({ demande, services, onAction }) {
  const [mode, setMode] = useState("");
  const [quand, setQuand] = useState(demande.desired_at ? demande.desired_at.slice(0, 16) : "");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const service = services.find((s) => s.id === demande.service_id);
  const statut = statuts[demande.status] || statuts.en_attente;

  async function valider(nouveauStatut, champs = {}) {
    setEnvoi(true);
    setErreur("");
    try {
      await onAction(demande.reference, { statut: nouveauStatut, ...champs });
      setMode("");
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnvoi(false);
    }
  }

  function confirmer(e) {
    e.preventDefault();
    if (!quand) {
      setErreur("Choisissez le jour et l'heure du rendez-vous.");
      return;
    }
    valider("confirme", { confirmeLe: `${quand}:00`, note: note.trim() });
  }

  return (
    <li className="carte demande">
      <div className="demande-haut">
        <div>
          <strong className="demande-nom">{demande.name}</strong>
          <span className="texte-doux">
            Réf. {demande.reference} · reçue {ilYA(demande.created_at)}
          </span>
        </div>
        <span className={`badge ${statut.classe}`}>{statut.texte}</span>
      </div>

      <dl className="demande-infos">
        <div>
          <dt>Motif</dt>
          <dd>{service ? service.name : "Je ne sais pas encore"}</dd>
        </div>
        <div>
          <dt>{demande.status === "en_attente" ? "Jour souhaité" : "Rendez-vous"}</dt>
          <dd>{demande.confirmed_at ? dateHeure(demande.confirmed_at) : demande.desired_at ? formaterDate(demande.desired_at) : "Pas de préférence"}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd className="demande-contact">
            <a href={`tel:${demande.phone}`}>{demande.phone}</a>
            <span className="badge badge-rose">
              {demande.contact_method === "sms" ? <MessageSquare size={12} /> : <Phone size={12} />}
              {demande.contact_method === "sms" ? "SMS" : "Appel"}
            </span>
          </dd>
        </div>
        <div>
          <dt>Langue</dt>
          <dd>{nomLangue(demande.language)}</dd>
        </div>
      </dl>

      {mode === "confirmer" && (
        <form className="demande-formulaire" onSubmit={confirmer}>
          <label className="champ">
            Jour et heure du rendez-vous
            <input type="datetime-local" value={quand} onChange={(e) => setQuand(e.target.value)} required />
          </label>
          <label className="champ">
            Note pour l'équipe (facultatif)
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          </label>
          <p className="champ-aide">La patiente reçoit une notification et un SMS avec la confirmation.</p>
          <div className="rangee">
            <button type="submit" className="btn-principal" disabled={envoi}>
              {envoi ? "Envoi…" : "Confirmer le rendez-vous"}
            </button>
            <button type="button" className="btn-texte" onClick={() => setMode("")}>
              Retour
            </button>
          </div>
        </form>
      )}

      {mode === "annuler" && (
        <div className="demande-formulaire">
          <label className="champ">
            Raison (facultatif, visible par l'équipe)
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          </label>
          <div className="rangee">
            <button type="button" className="btn-secondaire demande-danger" disabled={envoi} onClick={() => valider("annule", { note: note.trim() })}>
              {envoi ? "Envoi…" : "Annuler la demande"}
            </button>
            <button type="button" className="btn-texte" onClick={() => setMode("")}>
              Retour
            </button>
          </div>
        </div>
      )}

      {erreur && <Encadre ton="rouge">{erreur}</Encadre>}

      {!mode && demande.status === "en_attente" && (
        <div className="demande-actions">
          <button type="button" className="btn-principal" onClick={() => setMode("confirmer")}>
            <CalendarCheck size={18} />
            Confirmer
          </button>
          <button type="button" className="btn-secondaire" onClick={() => setMode("annuler")}>
            <CalendarX size={18} />
            Annuler
          </button>
        </div>
      )}

      {!mode && demande.status === "confirme" && (
        <div className="demande-actions">
          <button type="button" className="btn-secondaire" disabled={envoi} onClick={() => valider("honore")}>
            <UserCheck size={18} />
            Elle est venue
          </button>
          <button type="button" className="btn-secondaire" disabled={envoi} onClick={() => valider("absent")}>
            <UserX size={18} />
            Absente
          </button>
          <button type="button" className="btn-texte" onClick={() => setMode("annuler")}>
            Annuler
          </button>
        </div>
      )}
    </li>
  );
}

function Demandes() {
  const { user } = useAuth();
  const admin = estAdmin(user);
  const [centres, setCentres] = useState([]);
  const [params] = useSearchParams();
  const [choix, setChoix] = useState(() => Number(params.get("centre")) || "");
  const [centre, setCentre] = useState(null);
  const [demandes, setDemandes] = useState(null);
  const [erreur, setErreur] = useState("");
  const [onglet, setOnglet] = useState("attente");
  const [essai, setEssai] = useState(0);
  const [message, setMessage] = useState("");

  const centreId = admin ? choix || centres[0]?.id : user.health_center_id;

  useEffect(() => {
    if (!admin) return;
    let actif = true;
    listerCentres().then(
      (liste) => actif && setCentres(liste),
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [admin]);

  useEffect(() => {
    if (!centreId) return;
    let actif = true;
    Promise.all([obtenirCentre(centreId), demandesDuCentre(centreId)]).then(
      ([c, liste]) => {
        if (!actif) return;
        setCentre(c);
        setDemandes(liste);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [centreId, essai]);

  async function agir(reference, champs) {
    const misAJour = await changerStatut(reference, champs);
    setDemandes((liste) => liste.map((d) => (d.reference === reference ? misAJour : d)));
    const textes = {
      confirme: "Rendez-vous confirmé. La patiente est prévenue.",
      annule: "Demande annulée. La patiente est prévenue.",
      honore: "Visite enregistrée.",
      absent: "Absence enregistrée.",
    };
    setMessage(textes[champs.statut] || "Demande mise à jour.");
  }

  if (!admin && !user.health_center_id) {
    return (
      <div className="page page-etroite">
        <EtatVide Icone={Building2} titre="Aucun centre rattaché" texte="Votre compte n'est relié à aucun centre de santé. Demandez à l'administrateur de Laafi Rose de le rattacher." />
      </div>
    );
  }

  const enCours = onglets.find((o) => o.code === onglet);
  const visibles = (demandes || []).filter((d) => enCours.statuts.includes(d.status));
  const compte = (o) => (demandes || []).filter((d) => o.statuts.includes(d.status)).length;

  return (
    <div className="page pro-demandes">
      <div className="pro-entete">
        <div>
          <p className="surtitre">Espace professionnel</p>
          <h1 className="page-titre">Demandes de rendez-vous</h1>
          {centre && <p className="page-sous-titre">{centre.name}</p>}
        </div>
        <div className="rangee">
          {admin && centres.length > 0 && (
            <label className="champ pro-choix-centre">
              Centre
              <select value={centreId || ""} onChange={(e) => setChoix(Number(e.target.value))}>
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className="btn-secondaire" onClick={() => setEssai((n) => n + 1)}>
            <RefreshCw size={18} />
            Actualiser
          </button>
        </div>
      </div>

      <div className="puces pro-onglets" role="tablist">
        {onglets.map((o) => (
          <button key={o.code} type="button" role="tab" aria-selected={onglet === o.code} className={onglet === o.code ? "puce actif" : "puce"} onClick={() => setOnglet(o.code)}>
            {o.libelle}
            <span className="pro-compteur">{compte(o)}</span>
          </button>
        ))}
      </div>

      {message && (
        <div className="pro-message" role="status">
          <Encadre ton="vert">{message}</Encadre>
        </div>
      )}

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !demandes ? (
        <div className="grille grille-2">
          {[1, 2].map((n) => (
            <div key={n} className="squelette pro-squelette" />
          ))}
        </div>
      ) : visibles.length ? (
        <ul className="grille grille-2">
          {visibles.map((d) => (
            <CarteDemande key={d.reference} demande={d} services={centre?.services || []} onAction={agir} />
          ))}
        </ul>
      ) : (
        <EtatVide Icone={Inbox} titre={onglet === "attente" ? "Aucune demande à traiter" : "Rien pour le moment"} texte={onglet === "attente" ? "Les nouvelles demandes envoyées depuis l'application apparaîtront ici." : ""} />
      )}
    </div>
  );
}

export default function ProDemandes() {
  return (
    <AccesReserve roles={["medecin", "centre", "admin"]}>
      <Demandes />
    </AccesReserve>
  );
}
