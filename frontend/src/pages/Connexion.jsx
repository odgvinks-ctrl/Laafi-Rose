import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "../components/Logo.jsx";
import "./Connexion.css";

export default function Connexion() {
  const [form, setForm] = useState({ telephone: "", password: "" });
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);
  const { enregistrer } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErreur("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);
    try {
      const utilisateur = await login(form);
      enregistrer(utilisateur);
      navigate(utilisateur.role === "patient" ? "/mon-suivi" : "/soignant");
    } catch (err) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  }

  return (
    <section className="connexion">
      <form className="carte connexion-carte" onSubmit={handleSubmit}>
        <Logo />
        <h1 className="page-titre">Connexion</h1>
        <p className="page-sous-titre">Réservée aux patients suivis et aux soignants.</p>

        <label className="champ">
          Numéro de téléphone
          <input type="tel" name="telephone" inputMode="numeric" value={form.telephone} onChange={handleChange} required />
        </label>

        <label className="champ">
          Mot de passe
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </label>

        {erreur && <p className="message-erreur">{erreur}</p>}

        <button type="submit" className="btn-principal" disabled={chargement}>
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
