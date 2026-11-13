import "./Encadre.css";

export default function Encadre({ Icone, titre, children, ton = "rose" }) {
  return (
    <div className={`encadre encadre-${ton}`}>
      {Icone && <Icone size={22} className="encadre-icone" />}
      <div>
        {titre && <p className="encadre-titre">{titre}</p>}
        <div className="encadre-texte">{children}</div>
      </div>
    </div>
  );
}
