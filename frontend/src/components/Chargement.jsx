export default function Chargement({ texte = "Chargement..." }) {
  return (
    <p className="chargement" aria-busy="true">
      {texte}
    </p>
  );
}
