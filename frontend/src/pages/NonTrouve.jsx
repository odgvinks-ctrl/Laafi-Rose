import { Link } from "react-router-dom";

export default function NonTrouve() {
  return (
    <section className="page">
      <span className="surtitre">Page introuvable</span>
      <h1 className="page-titre">Cette page n'existe pas</h1>
      <p className="page-sous-titre">Le lien est peut-être incorrect, ou la page a été déplacée.</p>
      <Link to="/" className="btn-principal" style={{ marginTop: 24 }}>
        Retour à l'accueil
      </Link>
    </section>
  );
}
