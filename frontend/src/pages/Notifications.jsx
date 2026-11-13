import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import EtatVide from "../components/EtatVide.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { listerNotifications, marquerLue, toutMarquerLu } from "../api/notifications.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ilYA } from "../utils/texte.js";
import "./Notifications.css";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liste, setListe] = useState(null);
  const [erreur, setErreur] = useState("");
  const [essai, setEssai] = useState(0);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let actif = true;
    listerNotifications().then(
      (l) => {
        if (!actif) return;
        setListe(l);
        setErreur("");
      },
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [userId, essai]);

  async function ouvrir(notification) {
    if (!notification.read_at) {
      try {
        await marquerLue(notification.id);
      } catch {
        setEssai((n) => n + 1);
      }
    }
    if (notification.link) {
      navigate(notification.link);
    } else {
      setEssai((n) => n + 1);
    }
  }

  async function toutLire() {
    try {
      await toutMarquerLu();
    } finally {
      setEssai((n) => n + 1);
    }
  }

  if (!user) {
    return (
      <div className="page page-etroite">
        <h1 className="page-titre">Notifications</h1>
        <EtatVide Icone={Bell} titre="Connectez-vous pour voir vos notifications" texte="Les réponses des centres à vos demandes de rendez-vous arrivent ici.">
          <Link to="/connexion" className="btn-principal">
            Se connecter
          </Link>
        </EtatVide>
      </div>
    );
  }

  const nonLues = liste ? liste.filter((n) => !n.read_at).length : 0;

  return (
    <div className="page page-etroite notifications">
      <div className="notifications-entete">
        <h1 className="page-titre">Notifications</h1>
        {nonLues > 0 && (
          <button type="button" className="btn-texte" onClick={toutLire}>
            <CheckCheck size={18} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {erreur ? (
        <MessageErreur message={erreur} onReessayer={() => setEssai((n) => n + 1)} />
      ) : !liste ? (
        <div className="pile notifications-liste">
          {[1, 2, 3].map((n) => (
            <div key={n} className="squelette notifications-squelette" />
          ))}
        </div>
      ) : liste.length ? (
        <ul className="pile notifications-liste">
          {liste.map((n) => (
            <li key={n.id}>
              <button type="button" className={n.read_at ? "carte notification" : "carte notification non-lue"} onClick={() => ouvrir(n)}>
                <span className="notification-icone">{n.read_at ? <Bell size={20} /> : <BellRing size={20} />}</span>
                <span className="notification-corps">
                  <strong>{n.title}</strong>
                  {n.body && <span>{n.body}</span>}
                  <span className="texte-doux">{ilYA(n.created_at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <EtatVide Icone={Bell} titre="Aucune notification" texte="Vous êtes à jour." />
      )}
    </div>
  );
}
