import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo.jsx";
import logoComplet from "../assets/logo-laafi-rose.png";
import Encadre from "../components/Encadre.jsx";
import { connecter, inscrire } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePreferences } from "../context/PreferencesContext.jsx";
import "./Connexion.css";

export default function Connexion() {
  const navigate = useNavigate();
  const { enregistrer } = useAuth();
  const { preferences } = usePreferences();

  const [mode, setMode] = useState("connexion");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [prenom, setPrenom] = useState("");
  const [ville, setVille] = useState("");
  const [voir, setVoir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const inscription = mode === "inscription";

  async function valider(e) {
    e.preventDefault();
    setErreur("");

    if (!/^\d{8}$/.test(telephone.replace(/\s+/g, ""))) {
      setErreur("Le numéro doit contenir 8 chiffres.");
      return;
    }
    if (inscription && motDePasse.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (inscription && !prenom.trim()) {
      setErreur("Indiquez votre prénom.");
      return;
    }

    setEnvoi(true);
    try {
      const compte = inscription
        ? await inscrire({ telephone, motDePasse, prenom: prenom.trim(), ville: ville.trim(), langue: preferences.langueAudio })
        : await connecter(telephone, motDePasse);
      enregistrer(compte);
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="connexion">
      <section className="connexion-visuel" aria-hidden="true">
        <img src={logoComplet} alt="" />
        <p>Suivez vos demandes de rendez-vous et recevez les réponses des centres.</p>
      </section>

      <section className="connexion-contenu">
        <Link to="/" className="btn-texte connexion-retour">
          <ArrowLeft size={18} />
          Retour à l'accueil
        </Link>
        <Logo taille={36} />
        <h1 className="page-titre">{inscription ? "Créer un compte" : "Se connecter"}</h1>

        <div className="segments">
          <button type="button" className={!inscription ? "actif" : ""} onClick={() => setMode("connexion")}>
            J'ai un compte
          </button>
          <button type="button" className={inscription ? "actif" : ""} onClick={() => setMode("inscription")}>
            Nouveau compte
          </button>
        </div>

        <form className="connexion-formulaire" onSubmit={valider} noValidate>
          {inscription && (
            <>
              <label className="champ">
                Prénom
                <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" />
              </label>
              <label className="champ">
                Ville (facultatif)
                <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} autoComplete="address-level2" />
              </label>
            </>
          )}
          <label className="champ">
            Numéro de téléphone
            <span className="champ-prefixe">
              <span>+226</span>
              <input type="tel" inputMode="numeric" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="70 12 34 56" autoComplete="tel-national" />
            </span>
          </label>
          <label className="champ">
            Mot de passe
            <span className="champ-prefixe">
              <input
                type={voir ? "text" : "password"}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete={inscription ? "new-password" : "current-password"}
              />
              <button type="button" className="connexion-oeil" onClick={() => setVoir(!voir)} aria-label={voir ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                {voir ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
            {inscription && <span className="champ-aide">8 caractères minimum</span>}
          </label>

          {erreur && <Encadre ton="rouge">{erreur}</Encadre>}

          <button type="submit" className="btn-principal btn-large" disabled={envoi}>
            {envoi ? "Patientez…" : inscription ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <p className="texte-doux connexion-note">Un compte n'est pas nécessaire pour lire les fiches, trouver un centre ou utiliser l'assistant.</p>
      </section>
    </div>
  );
}
