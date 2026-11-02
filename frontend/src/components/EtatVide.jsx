import "./EtatVide.css";

export default function EtatVide({ titre, texte, children }) {
  return (
    <div className="etat-vide">
      <h2>{titre}</h2>
      {texte && <p>{texte}</p>}
      {children}
    </div>
  );
}
