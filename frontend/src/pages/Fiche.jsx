import { useParams } from "react-router-dom";
import "./Fiche.css";

export default function Fiche() {
  const { slug } = useParams();

  return (
    <section className="page fiche" data-slug={slug}>
      <h1 className="page-titre">Fiche</h1>
    </section>
  );
}
