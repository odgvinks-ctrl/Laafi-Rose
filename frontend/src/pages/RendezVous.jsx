import { useParams } from "react-router-dom";
import "./RendezVous.css";

export default function RendezVous() {
  const { id } = useParams();

  return (
    <section className="page rendez-vous" data-id={id}>
      <h1 className="page-titre">Demande de rendez-vous</h1>
      <p className="page-sous-titre">Aucune information médicale ne vous sera demandée.</p>
    </section>
  );
}
