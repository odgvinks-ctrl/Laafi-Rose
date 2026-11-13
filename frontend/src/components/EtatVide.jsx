import "./EtatVide.css";

export default function EtatVide({ Icone, titre, texte, children }) {
  return (
    <div className="etat-vide">
      {Icone && (
        <span className="etat-vide-icone">
          <Icone size={28} />
        </span>
      )}
      <h2>{titre}</h2>
      {texte && <p>{texte}</p>}
      {children}
    </div>
  );
}
