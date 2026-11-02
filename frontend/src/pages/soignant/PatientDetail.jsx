import { useParams } from "react-router-dom";
import "./PatientDetail.css";

export default function PatientDetail() {
  const { id } = useParams();

  return (
    <section className="patient-detail" data-id={id}>
      <h1 className="page-titre">Dossier du patient</h1>
    </section>
  );
}
