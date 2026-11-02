import { useParams } from "react-router-dom";
import "./Ecouter.css";

export default function Ecouter() {
  const { id } = useParams();

  return (
    <section className="page ecouter" data-id={id}>
      <h1 className="page-titre">Écouter</h1>
      <p className="page-sous-titre">Le texte reste affiché en français pendant l'écoute.</p>
    </section>
  );
}
