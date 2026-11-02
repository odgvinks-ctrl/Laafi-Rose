import "./FeuilleModale.css";

export default function FeuilleModale({ titre, ouverte, onFermer, children }) {
  if (!ouverte) return null;

  return (
    <div className="feuille-fond">
      <button type="button" className="feuille-voile" aria-label="Fermer" onClick={onFermer} />
      <div className="feuille" role="dialog" aria-modal="true" aria-label={titre}>
        <h2>{titre}</h2>
        {children}
      </div>
    </div>
  );
}
