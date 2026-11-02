import { useParams } from "react-router-dom";
import "./AlerteStatut.css";

export default function AlerteStatut() {
  const { id } = useParams();

  return (
    <section className="page alerte-statut" data-id={id}>
      <h1 className="page-titre">Votre alerte a été envoyée</h1>
      <p className="page-sous-titre">Votre médecin et votre centre ont reçu votre alerte et votre position.</p>
    </section>
  );
}
