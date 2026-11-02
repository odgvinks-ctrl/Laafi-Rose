import { useParams } from "react-router-dom";
import "./CentreDetail.css";

export default function CentreDetail() {
  const { id } = useParams();

  return (
    <section className="page centre-detail" data-id={id}>
      <h1 className="page-titre">Fiche du centre</h1>
    </section>
  );
}
