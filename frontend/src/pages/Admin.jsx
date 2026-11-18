import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Plus, X, BadgeCheck, CircleHelp, Settings, UserX, Eye, EyeOff } from "lucide-react";
import AccesReserve from "../components/AccesReserve.jsx";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { listerCentres } from "../api/centres.js";
import { modifierCentre } from "../api/pro.js";
import { creerCentre, creerCompte, desactiverCompte, listerComptes } from "../api/admin.js";
import { libellesRoles, roleDe } from "../utils/roles.js";
import { dateCourte } from "../utils/texte.js";
import "./Admin.css";

const centreVide = { name: "", type: "", city: "Ouagadougou", district: "", phone: "", accepts_appointments: true, verified: false };
const compteVide = { prenom: "", nom: "", telephone: "", motDePasse: "", role: "medecin", centreId: "" };

const filtresComptes = [
  { code: "", nom: "Tous" },
  { code: "soignant", nom: "Soignants" },
  { code: "centre", nom: "Accueils de centre" },
  { code: "admin", nom: "Administrateurs" },
  { code: "utilisateur", nom: "Utilisatrices" },
];

function OngletCentres({ centres, setCentres }) {
  const [formulaire, setFormulaire] = useState(null);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function basculerVerification(centre) {
    setErreur("");
    try {
      const misAJour = await modifierCentre(centre.id, { verified: !centre.verified });
      setCentres((liste) => liste.map((c) => (c.id === centre.id ? misAJour : c)));
    } catch (e) {
      setErreur(e.message);
    }
  }

  async function creer(e) {
    e.preventDefault();
    if (!formulaire.name.trim()) {
      setErreur("Le nom du centre est obligatoire.");
      return;
    }
    setEnvoi(true);
    setErreur("");
    try {
      const corps = { ...formulaire };
      ["name", "type", "city", "district", "phone"].forEach((cle) => {
        corps[cle] = corps[cle].trim() || null;
      });
      const centre = await creerCentre(corps);
      setCentres((liste) => [...liste, centre].sort((a, b) => a.name.localeCompare(b.name, "fr")));
      setFormulaire(null);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  const aVerifier = centres.filter((c) => !c.verified).length;

  return (
    <section>
      <div className="admin-barre">
        <p className="texte-doux">
          {centres.length} centre{centres.length > 1 ? "s" : ""} · {aVerifier} à vérifier
        </p>
        {!formulaire && (
          <button type="button" className="btn-principal" onClick={() => setFormulaire(centreVide)}>
            <Plus size={18} />
            Ajouter un centre
          </button>
        )}
      </div>

      {formulaire && (
        <form className="carte admin-formulaire" onSubmit={creer}>
          <div className="admin-formulaire-haut">
            <h2>Nouveau centre</h2>
            <button type="button" className="admin-fermer" aria-label="Fermer" onClick={() => setFormulaire(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="admin-champs">
            {[
              ["name", "Nom du centre"],
              ["type", "Type (CSPS, CMA, CHU…)"],
              ["city", "Ville"],
              ["district", "Quartier"],
              ["phone", "Téléphone"],
            ].map(([cle, libelle]) => (
              <label key={cle} className="champ">
                {libelle}
                <input type="text" value={formulaire[cle]} onChange={(e) => setFormulaire({ ...formulaire, [cle]: e.target.value })} />
              </label>
            ))}
          </div>
          <label className="interrupteur">
            <span>Reçoit des demandes de rendez-vous</span>
            <input type="checkbox" checked={formulaire.accepts_appointments} onChange={(e) => setFormulaire({ ...formulaire, accepts_appointments: e.target.checked })} />
          </label>
          <label className="interrupteur">
            <span>Informations déjà vérifiées</span>
            <input type="checkbox" checked={formulaire.verified} onChange={(e) => setFormulaire({ ...formulaire, verified: e.target.checked })} />
          </label>
          <p className="champ-aide">Les horaires, l'adresse, la position et les services se complètent ensuite dans « Gérer ».</p>
          <button type="submit" className="btn-principal" disabled={envoi}>
            {envoi ? "Création…" : "Créer le centre"}
          </button>
        </form>
      )}

      {erreur && (
        <div className="admin-erreur">
          <Encadre ton="rouge">{erreur}</Encadre>
        </div>
      )}

      <ul className="grille grille-2 admin-liste">
        {centres.map((c) => (
          <li key={c.id} className="carte admin-centre">
            <div>
              <strong>{c.name}</strong>
              <span className="texte-doux">{[c.type, c.district, c.city].filter(Boolean).join(" · ") || "Informations à compléter"}</span>
            </div>
            <div className="rangee">
              {c.verified ? (
                <span className="badge badge-vert">
                  <BadgeCheck size={14} />
                  Vérifié {c.verified_at ? `le ${dateCourte(c.verified_at)}` : ""}
                </span>
              ) : (
                <span className="badge badge-ambre">
                  <CircleHelp size={14} />À vérifier
                </span>
              )}
              <span className="badge badge-neutre">{c.services.length} service{c.services.length > 1 ? "s" : ""}</span>
              {!c.accepts_appointments && <span className="badge badge-neutre">Sans rendez-vous en ligne</span>}
            </div>
            <div className="admin-actions">
              <button type="button" className={c.verified ? "btn-secondaire" : "btn-principal"} onClick={() => basculerVerification(c)}>
                {c.verified ? "Retirer la vérification" : "Marquer comme vérifié"}
              </button>
              <Link to={`/pro/centre?centre=${c.id}`} className="btn-secondaire">
                <Settings size={18} />
                Gérer
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OngletComptes({ centres }) {
  const [filtre, setFiltre] = useState("");
  const [comptes, setComptes] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);
  const [formulaire, setFormulaire] = useState(null);
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurFormulaire, setErreurFormulaire] = useState("");
  const [desactives, setDesactives] = useState([]);
  const [aDesactiver, setADesactiver] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let actif = true;
    listerComptes(filtre || undefined).then(
      (liste) => {
        if (!actif) return;
        setComptes(liste);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [filtre, essai]);

  const nomCentre = (id) => centres.find((c) => c.id === id)?.name;
  const centreRequis = formulaire && formulaire.role !== "admin";

  async function creer(e) {
    e.preventDefault();
    setErreurFormulaire("");
    if (!formulaire.prenom.trim()) return setErreurFormulaire("Le prénom est obligatoire.");
    if (!/^\d{8}$/.test(formulaire.telephone.replace(/\s+/g, ""))) return setErreurFormulaire("Le numéro doit contenir 8 chiffres.");
    if (formulaire.motDePasse.length < 8) return setErreurFormulaire("Le mot de passe doit contenir au moins 8 caractères.");
    if (centreRequis && !formulaire.centreId) return setErreurFormulaire("Choisissez le centre de ce compte.");

    setEnvoi(true);
    try {
      const compte = await creerCompte({ ...formulaire, centreId: centreRequis ? formulaire.centreId : null });
      setMessage(`Compte créé pour ${compte.full_name || compte.phone}. Transmettez-lui son numéro et son mot de passe en privé.`);
      setFormulaire(null);
      setEssai((n) => n + 1);
    } catch (err) {
      setErreurFormulaire(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  async function desactiver(compte) {
    try {
      await desactiverCompte(compte.id);
      setDesactives((liste) => [...liste, compte.id]);
      setADesactiver(null);
    } catch (e) {
      setErreur(e.message);
    }
  }

  return (
    <section>
      <div className="admin-barre">
        <div className="puces">
          {filtresComptes.map((f) => (
            <button key={f.code} type="button" className={filtre === f.code ? "puce actif" : "puce"} onClick={() => setFiltre(f.code)}>
              {f.nom}
            </button>
          ))}
        </div>
        {!formulaire && (
          <button type="button" className="btn-principal" onClick={() => setFormulaire({ ...compteVide, centreId: centres[0]?.id || "" })}>
            <Plus size={18} />
            Créer un compte
          </button>
        )}
      </div>

      {message && (
        <div className="admin-erreur">
          <Encadre ton="vert">{message}</Encadre>
        </div>
      )}

      {formulaire && (
        <form className="carte admin-formulaire" onSubmit={creer} noValidate>
          <div className="admin-formulaire-haut">
            <h2>Nouveau compte professionnel</h2>
            <button type="button" className="admin-fermer" aria-label="Fermer" onClick={() => setFormulaire(null)}>
              <X size={20} />
            </button>
          </div>
          <div className="champ">
            Rôle
            <div className="segments">
              {["medecin", "centre", "admin"].map((r) => (
                <button key={r} type="button" className={formulaire.role === r ? "actif" : ""} aria-pressed={formulaire.role === r} onClick={() => setFormulaire({ ...formulaire, role: r })}>
                  {libellesRoles[r]}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-champs">
            <label className="champ">
              Prénom
              <input type="text" value={formulaire.prenom} onChange={(e) => setFormulaire({ ...formulaire, prenom: e.target.value })} />
            </label>
            <label className="champ">
              Nom (facultatif)
              <input type="text" value={formulaire.nom} onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })} />
            </label>
            <label className="champ">
              Téléphone
              <span className="champ-prefixe">
                <span>+226</span>
                <input type="tel" inputMode="numeric" value={formulaire.telephone} onChange={(e) => setFormulaire({ ...formulaire, telephone: e.target.value })} placeholder="70 12 34 56" />
              </span>
            </label>
            <label className="champ">
              Mot de passe provisoire
              <span className="champ-prefixe">
                <input type={voir ? "text" : "password"} value={formulaire.motDePasse} onChange={(e) => setFormulaire({ ...formulaire, motDePasse: e.target.value })} autoComplete="new-password" />
                <button type="button" className="admin-oeil" onClick={() => setVoir(!voir)} aria-label={voir ? "Masquer" : "Afficher"}>
                  {voir ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
              <span className="champ-aide">8 caractères minimum</span>
            </label>
          </div>
          {centreRequis && (
            <label className="champ">
              Centre de rattachement
              <select value={formulaire.centreId} onChange={(e) => setFormulaire({ ...formulaire, centreId: e.target.value })}>
                <option value="">Choisir…</option>
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {erreurFormulaire && <Encadre ton="rouge">{erreurFormulaire}</Encadre>}
          <button type="submit" className="btn-principal" disabled={envoi}>
            {envoi ? "Création…" : "Créer le compte"}
          </button>
        </form>
      )}

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !comptes ? (
        <div className="squelette admin-squelette" />
      ) : comptes.length ? (
        <ul className="admin-comptes">
          {comptes.map((c) => {
            const role = roleDe(c);
            const desactive = desactives.includes(c.id);
            return (
              <li key={c.id} className={desactive ? "carte admin-compte desactive" : "carte admin-compte"}>
                <div>
                  <strong>{c.full_name || c.profile?.first_name || "Sans nom"}</strong>
                  <span className="texte-doux">
                    {c.phone} · {libellesRoles[role] || role}
                    {nomCentre(c.health_center_id) && ` · ${nomCentre(c.health_center_id)}`} · créé le {dateCourte(c.created_at)}
                  </span>
                </div>
                {desactive ? (
                  <span className="badge badge-rouge">Désactivé</span>
                ) : aDesactiver === c.id ? (
                  <span className="rangee">
                    <button type="button" className="btn-texte" onClick={() => setADesactiver(null)}>
                      Annuler
                    </button>
                    <button type="button" className="btn-texte admin-danger" onClick={() => desactiver(c)}>
                      Confirmer
                    </button>
                  </span>
                ) : (
                  <button type="button" className="btn-texte" onClick={() => setADesactiver(c.id)}>
                    <UserX size={18} />
                    Désactiver
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EtatVide Icone={Users} titre="Aucun compte dans cette catégorie" />
      )}
    </section>
  );
}

function Administration() {
  const [onglet, setOnglet] = useState("centres");
  const [centres, setCentres] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let actif = true;
    listerCentres().then(
      (liste) => {
        if (!actif) return;
        setCentres(liste);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [essai]);

  return (
    <div className="page admin">
      <p className="surtitre">Espace professionnel</p>
      <h1 className="page-titre">Administration</h1>
      <p className="page-sous-titre">Vérifiez les centres de santé et gérez les comptes des professionnels.</p>

      <div className="segments admin-onglets" role="tablist">
        <button type="button" role="tab" aria-selected={onglet === "centres"} className={onglet === "centres" ? "actif" : ""} onClick={() => setOnglet("centres")}>
          <Building2 size={18} /> Centres
        </button>
        <button type="button" role="tab" aria-selected={onglet === "comptes"} className={onglet === "comptes" ? "actif" : ""} onClick={() => setOnglet("comptes")}>
          <Users size={18} /> Comptes
        </button>
      </div>

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !centres ? (
        <div className="squelette admin-squelette" />
      ) : onglet === "centres" ? (
        <OngletCentres centres={centres} setCentres={setCentres} />
      ) : (
        <OngletComptes centres={centres} />
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <AccesReserve roles={["admin"]}>
      <Administration />
    </AccesReserve>
  );
}
