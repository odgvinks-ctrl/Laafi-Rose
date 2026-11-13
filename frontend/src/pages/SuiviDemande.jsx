import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Hourglass, CalendarCheck, CalendarX, ArrowLeft } from "lucide-react";
import EtatVide from "../components/EtatVide.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { suivreDemande } from "../api/rendezVous.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formaterDate } from "../utils/texte.js";
import "./SuiviDemande.css";

const statuts = {
  en_attente: { titre: "En attente de confirmation", texte: "Le centre va vous contacter.", Icone: Hourglass, ton: "ambre" },
  confirme: { titre: "Rendez-vous confirmé", texte: "Présentez-vous au centre avec votre référence.", Icone: CalendarCheck, ton: "vert" },
  honore: { titre: "Rendez-vous effectué", texte: "Merci d'avoir pris soin de vous.", Icone: CalendarCheck, ton: "vert" },
  annule: { titre: "Demande annulée", texte: "Vous pouvez faire une nouvelle demande ou appeler le centre.", Icone: CalendarX, ton: "rouge" },
  absent: { titre: "Rendez-vous manqué", texte: "Vous pouvez faire une nouvelle demande ou appeler le centre.", Icone: CalendarX, ton: "rouge" },
};

export default function SuiviDemande() {
  const { reference } = useParams();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [erreur, setErreur] = useState("");
  const telephone = user?.phone;

  useEffect(() => {
    if (!telephone) return;
    let actif = true;
    suivreDemande(reference, telephone).then(
      (d) => actif && setDemande(d),
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [reference, telephone]);

  if (!user) {
    return (
      <div className="page page-etroite">
        <EtatVide Icone={Hourglass} titre="Connectez-vous pour suivre cette demande">
          <Link to="/connexion" className="btn-principal">
            Se connecter
          </Link>
        </EtatVide>
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="page page-etroite">
        <MessageErreur message={erreur} />
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="page page-etroite">
        <div className="squelette suivi-squelette" />
      </div>
    );
  }

  const statut = statuts[demande.status] || statuts.en_attente;

  return (
    <div className="page page-etroite suivi">
      <Link to="/notifications" className="btn-texte">
        <ArrowLeft size={18} />
        Notifications
      </Link>
      <span className={`suivi-icone suivi-${statut.ton}`}>
        <statut.Icone size={32} />
      </span>
      <h1 className="page-titre">{statut.titre}</h1>
      <p className="page-sous-titre">{statut.texte}</p>
      <div className="carte suivi-carte">
        <span className="surtitre">Référence</span>
        <strong>{demande.reference}</strong>
        {demande.confirmed_at && <span>Le {formaterDate(demande.confirmed_at)}</span>}
        {!demande.confirmed_at && demande.desired_at && <span className="texte-doux">Jour souhaité : {formaterDate(demande.desired_at)}</span>}
      </div>
      <Link to={`/centres/${demande.health_center_id}`} className="btn-principal">
        Voir le centre
      </Link>
    </div>
  );
}
