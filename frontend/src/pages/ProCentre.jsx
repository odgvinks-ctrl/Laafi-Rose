import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Save, LocateFixed, Plus, Trash2, Building2, ExternalLink } from "lucide-react";
import AccesReserve from "../components/AccesReserve.jsx";
import Encadre from "../components/Encadre.jsx";
import EtatVide from "../components/EtatVide.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useGeolocalisation } from "../hooks/useGeolocalisation.js";
import { listerCentres, obtenirCentre } from "../api/centres.js";
import { ajouterService, modifierCentre, modifierService, supprimerService } from "../api/pro.js";
import { categoriesServices, nomCategorieService } from "../data/servicesSante.js";
import { estAdmin } from "../utils/roles.js";
import "./ProCentre.css";

const champsTexte = [
  { cle: "name", libelle: "Nom du centre" },
  { cle: "type", libelle: "Type (CSPS, CMA, CHU, clinique…)" },
  { cle: "phone", libelle: "Téléphone" },
  { cle: "city", libelle: "Ville" },
  { cle: "district", libelle: "Quartier" },
  { cle: "address", libelle: "Adresse ou repère" },
  { cle: "opening_hours", libelle: "Horaires", aide: "Ex. : Lun-Ven 7h30-16h00 · Sam 8h00-12h00" },
];

const serviceVide = { name: "", category: "depistage_sein", description: "", is_free: true };

function versFormulaire(centre) {
  const valeurs = {};
  champsTexte.forEach(({ cle }) => {
    valeurs[cle] = centre[cle] || "";
  });
  valeurs.latitude = centre.latitude ?? "";
  valeurs.longitude = centre.longitude ?? "";
  valeurs.accepts_appointments = centre.accepts_appointments;
  return valeurs;
}

function FicheCentre({ centre, onMisAJour }) {
  const geo = useGeolocalisation();
  const [valeurs, setValeurs] = useState(() => versFormulaire(centre));
  const [envoi, setEnvoi] = useState(false);
  const [retour, setRetour] = useState(null);

  function changer(cle, valeur) {
    setValeurs((actuel) => ({ ...actuel, [cle]: valeur }));
    setRetour(null);
  }

  async function positionActuelle() {
    const p = await geo.demander();
    if (p) {
      changer("latitude", p.latitude.toFixed(5));
      changer("longitude", p.longitude.toFixed(5));
    }
  }

  async function enregistrer(e) {
    e.preventDefault();
    if (!valeurs.name.trim()) {
      setRetour({ ton: "rouge", texte: "Le nom du centre est obligatoire." });
      return;
    }
    const champs = {};
    champsTexte.forEach(({ cle }) => {
      champs[cle] = valeurs[cle].trim() || null;
    });
    champs.name = valeurs.name.trim();
    champs.latitude = valeurs.latitude === "" ? null : Number(valeurs.latitude);
    champs.longitude = valeurs.longitude === "" ? null : Number(valeurs.longitude);
    champs.accepts_appointments = valeurs.accepts_appointments;

    setEnvoi(true);
    try {
      onMisAJour(await modifierCentre(centre.id, champs));
      setRetour({ ton: "vert", texte: "Informations enregistrées. Elles sont visibles tout de suite dans l'application." });
    } catch (err) {
      setRetour({ ton: "rouge", texte: err.message });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className="carte pro-fiche" onSubmit={enregistrer}>
      <h2>Informations du centre</h2>
      <div className="pro-champs">
        {champsTexte.map(({ cle, libelle, aide }) => (
          <label key={cle} className={cle === "address" || cle === "opening_hours" ? "champ pro-champ-large" : "champ"}>
            {libelle}
            <input type="text" value={valeurs[cle]} onChange={(e) => changer(cle, e.target.value)} />
            {aide && <span className="champ-aide">{aide}</span>}
          </label>
        ))}
        <label className="champ">
          Latitude
          <input type="number" step="any" value={valeurs.latitude} onChange={(e) => changer("latitude", e.target.value)} />
        </label>
        <label className="champ">
          Longitude
          <input type="number" step="any" value={valeurs.longitude} onChange={(e) => changer("longitude", e.target.value)} />
        </label>
      </div>
      <button type="button" className="btn-texte pro-position" onClick={positionActuelle} disabled={geo.enCours}>
        <LocateFixed size={18} />
        {geo.enCours ? "Localisation…" : "Utiliser ma position actuelle (si je suis au centre)"}
      </button>
      {geo.erreur && <p className="champ-erreur">{geo.erreur}</p>}

      <label className="interrupteur">
        <span>Recevoir des demandes de rendez-vous en ligne</span>
        <input type="checkbox" checked={valeurs.accepts_appointments} onChange={(e) => changer("accepts_appointments", e.target.checked)} />
      </label>

      {retour && <Encadre ton={retour.ton}>{retour.texte}</Encadre>}

      <button type="submit" className="btn-principal" disabled={envoi}>
        <Save size={18} />
        {envoi ? "Enregistrement…" : "Enregistrer les informations"}
      </button>
    </form>
  );
}

function ServicesCentre({ centre, onMisAJour }) {
  const [nouveau, setNouveau] = useState(serviceVide);
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [erreur, setErreur] = useState("");

  function remplacer(service) {
    onMisAJour({ ...centre, services: centre.services.map((s) => (s.id === service.id ? service : s)) });
  }

  async function basculer(service, cle) {
    setErreur("");
    try {
      remplacer(await modifierService(service.id, { [cle]: !service[cle] }));
    } catch (e) {
      setErreur(e.message);
    }
  }

  async function supprimer(service) {
    setErreur("");
    try {
      await supprimerService(service.id);
      onMisAJour({ ...centre, services: centre.services.filter((s) => s.id !== service.id) });
      setASupprimer(null);
    } catch (e) {
      setErreur(e.message);
    }
  }

  async function ajouter(e) {
    e.preventDefault();
    if (!nouveau.name.trim()) {
      setErreur("Donnez un nom au service.");
      return;
    }
    setErreur("");
    try {
      const service = await ajouterService(centre.id, {
        name: nouveau.name.trim(),
        category: nouveau.category,
        description: nouveau.description.trim() || null,
        is_free: nouveau.is_free,
        available: true,
      });
      onMisAJour({ ...centre, services: [...centre.services, service] });
      setNouveau(serviceVide);
      setAjoutOuvert(false);
    } catch (err) {
      setErreur(err.message);
    }
  }

  return (
    <section className="carte pro-services">
      <div className="pro-services-haut">
        <h2>Services proposés</h2>
        {!ajoutOuvert && (
          <button type="button" className="btn-secondaire" onClick={() => setAjoutOuvert(true)}>
            <Plus size={18} />
            Ajouter
          </button>
        )}
      </div>

      {ajoutOuvert && (
        <form className="pro-ajout" onSubmit={ajouter}>
          <label className="champ">
            Nom du service
            <input type="text" value={nouveau.name} onChange={(e) => setNouveau({ ...nouveau, name: e.target.value })} placeholder="Ex. : Examen clinique des seins" />
          </label>
          <label className="champ">
            Catégorie
            <select value={nouveau.category} onChange={(e) => setNouveau({ ...nouveau, category: e.target.value })}>
              {categoriesServices.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
          <label className="champ">
            Description (facultatif)
            <input type="text" value={nouveau.description} onChange={(e) => setNouveau({ ...nouveau, description: e.target.value })} />
          </label>
          <label className="case">
            <input type="checkbox" checked={nouveau.is_free} onChange={(e) => setNouveau({ ...nouveau, is_free: e.target.checked })} />
            <span>Service gratuit</span>
          </label>
          <div className="rangee">
            <button type="submit" className="btn-principal">
              Ajouter le service
            </button>
            <button type="button" className="btn-texte" onClick={() => setAjoutOuvert(false)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {erreur && <Encadre ton="rouge">{erreur}</Encadre>}

      {centre.services.length ? (
        <ul className="pro-liste-services">
          {centre.services.map((s) => (
            <li key={s.id}>
              <div className="pro-service-texte">
                <strong>{s.name}</strong>
                <span className="texte-doux">{nomCategorieService(s.category)}</span>
              </div>
              <div className="pro-service-actions">
                <label className="interrupteur interrupteur-compact">
                  <span>Disponible</span>
                  <input type="checkbox" checked={s.available} onChange={() => basculer(s, "available")} />
                </label>
                <label className="interrupteur interrupteur-compact">
                  <span>Gratuit</span>
                  <input type="checkbox" checked={s.is_free} onChange={() => basculer(s, "is_free")} />
                </label>
                {aSupprimer === s.id ? (
                  <span className="rangee">
                    <button type="button" className="btn-texte" onClick={() => setASupprimer(null)}>
                      Garder
                    </button>
                    <button type="button" className="btn-texte pro-supprimer" onClick={() => supprimer(s)}>
                      Supprimer
                    </button>
                  </span>
                ) : (
                  <button type="button" className="pro-poubelle" aria-label={`Supprimer ${s.name}`} onClick={() => setASupprimer(s.id)}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="texte-doux">Aucun service pour le moment. Ajoutez ce que votre centre propose pour que les patientes puissent le choisir.</p>
      )}
    </section>
  );
}

function MonCentre() {
  const { user } = useAuth();
  const admin = estAdmin(user);
  const [centres, setCentres] = useState([]);
  const [params] = useSearchParams();
  const [choix, setChoix] = useState(() => Number(params.get("centre")) || "");
  const [centre, setCentre] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);

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
    obtenirCentre(centreId).then(
      (c) => {
        if (!actif) return;
        setCentre(c);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [centreId, essai]);

  if (!admin && !user.health_center_id) {
    return (
      <div className="page page-etroite">
        <EtatVide Icone={Building2} titre="Aucun centre rattaché" texte="Votre compte n'est relié à aucun centre de santé. Demandez à l'administrateur de Laafi Rose de le rattacher." />
      </div>
    );
  }

  return (
    <div className="page pro-centre">
      <div className="pro-entete-centre">
        <div>
          <p className="surtitre">Espace professionnel</p>
          <h1 className="page-titre">Mon centre</h1>
          <p className="page-sous-titre">Ces informations s'affichent dans l'annuaire des centres.</p>
        </div>
        <div className="rangee">
          {admin && centres.length > 0 && (
            <label className="champ">
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
          {centre && (
            <Link to={`/centres/${centre.id}`} className="btn-secondaire">
              <ExternalLink size={18} />
              Voir la fiche publique
            </Link>
          )}
        </div>
      </div>

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !centre ? (
        <div className="squelette pro-centre-squelette" />
      ) : (
        <div className="pro-centre-grille">
          <FicheCentre key={centre.id} centre={centre} onMisAJour={setCentre} />
          <ServicesCentre centre={centre} onMisAJour={setCentre} />
        </div>
      )}
    </div>
  );
}

export default function ProCentre() {
  return (
    <AccesReserve roles={["centre", "admin"]}>
      <MonCentre />
    </AccesReserve>
  );
}
