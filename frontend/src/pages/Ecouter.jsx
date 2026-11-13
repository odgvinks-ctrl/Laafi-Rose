import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Download, CircleCheck, Hourglass } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import MessageErreur from "../components/MessageErreur.jsx";
import { obtenirArticle } from "../api/articles.js";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useEnLigne } from "../hooks/useEnLigne.js";
import { nomLangue } from "../data/langues.js";
import { audioEnregistre, sourceAudio, telechargerAudio } from "../utils/audiosHorsLigne.js";
import { duree } from "../utils/texte.js";
import "./Ecouter.css";

const vitesses = [1, 1.25, 0.75];

export default function Ecouter() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const enLigne = useEnLigne();
  const { preferences } = usePreferences();
  const lecteur = useRef(null);

  const [article, setArticle] = useState(null);
  const [erreur, setErreur] = useState("");
  const [choix, setChoix] = useState("");
  const [source, setSource] = useState("");
  const [enLecture, setEnLecture] = useState(false);
  const [position, setPosition] = useState(0);
  const [total, setTotal] = useState(0);
  const [vitesse, setVitesse] = useState(1);
  const [erreurAudio, setErreurAudio] = useState("");
  const [telechargement, setTelechargement] = useState(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    let actif = true;
    obtenirArticle(slug).then(
      (a) => actif && setArticle(a),
      (e) => actif && setErreur(e.message),
    );
    return () => {
      actif = false;
    };
  }, [slug]);

  const audios = article?.audios || {};
  const codes = Object.keys(audios);
  const langue = choix || (audios[preferences.langueAudio] ? preferences.langueAudio : codes[0]);
  const url = langue ? audios[langue] : "";
  const hors = langue ? audioEnregistre(slug, langue) : null;

  useEffect(() => {
    if (!url) return;
    let actif = true;
    let objet = "";
    sourceAudio(url).then((s) => {
      if (!actif) return;
      if (s.startsWith("blob:")) objet = s;
      setSource(s);
    });
    return () => {
      actif = false;
      if (objet) URL.revokeObjectURL(objet);
    };
  }, [url]);

  function changerLangue(code) {
    lecteur.current?.pause();
    setChoix(code);
    setPosition(0);
    setErreurAudio("");
  }

  function basculerLecture() {
    const audio = lecteur.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setErreurAudio("Impossible de lire l'audio. Vérifiez votre connexion ou enregistrez-le quand vous aurez du réseau."));
    } else {
      audio.pause();
    }
  }

  function deplacer(secondes) {
    const audio = lecteur.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + secondes), audio.duration || 0);
  }

  function changerVitesse() {
    const suivante = vitesses[(vitesses.indexOf(vitesse) + 1) % vitesses.length];
    if (lecteur.current) lecteur.current.playbackRate = suivante;
    setVitesse(suivante);
  }

  async function telecharger() {
    setTelechargement(true);
    setErreurAudio("");
    try {
      await telechargerAudio({ slug, titre: article.titre, langue, url });
      setVersion((v) => v + 1);
    } catch (e) {
      setErreurAudio(e.message);
    } finally {
      setTelechargement(false);
    }
  }

  if (erreur) {
    return (
      <div className="page page-etroite">
        <MessageErreur message={erreur} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page page-etroite">
        <div className="squelette ecouter-squelette" />
      </div>
    );
  }

  return (
    <div className="page page-etroite ecouter">
      <button type="button" className="btn-texte" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Retour
      </button>
      <p className="surtitre">Écouter la fiche</p>
      <h1 className="page-titre">{article.titre}</h1>

      {!codes.length ? (
        <div className="ecouter-bloc">
          <Encadre Icone={Hourglass} titre="Version audio en préparation" ton="ambre">
            L'audio de cette fiche n'est pas encore disponible. Vous pouvez lire le texte en attendant.
          </Encadre>
        </div>
      ) : (
        <>
          <div className="segments ecouter-bloc" role="group" aria-label="Langue de l'audio">
            {codes.map((code) => (
              <button key={code} type="button" className={langue === code ? "actif" : ""} aria-pressed={langue === code} onClick={() => changerLangue(code)}>
                {nomLangue(code)}
              </button>
            ))}
          </div>

          <div className="carte ecouter-lecteur">
            <audio
              ref={lecteur}
              src={source || undefined}
              preload="metadata"
              onPlay={() => setEnLecture(true)}
              onPause={() => setEnLecture(false)}
              onEnded={() => setEnLecture(false)}
              onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                setTotal(e.currentTarget.duration);
                e.currentTarget.playbackRate = vitesse;
              }}
              onError={() => source && setErreurAudio("Impossible de charger l'audio. Vérifiez votre connexion.")}
            />
            <input
              type="range"
              className="ecouter-progression"
              min="0"
              max={total || 0}
              step="1"
              value={Math.min(position, total || 0)}
              onChange={(e) => {
                if (lecteur.current) lecteur.current.currentTime = Number(e.target.value);
              }}
              aria-label="Position dans l'audio"
            />
            <div className="ecouter-temps">
              <span>{duree(position)}</span>
              <span>{duree(total)}</span>
            </div>
            <div className="ecouter-commandes">
              <button type="button" className="ecouter-petit" onClick={() => deplacer(-10)} aria-label="Reculer de 10 secondes">
                <RotateCcw size={24} />
                <span>10</span>
              </button>
              <button type="button" className="ecouter-lecture" onClick={basculerLecture} aria-label={enLecture ? "Pause" : "Lecture"}>
                {enLecture ? <Pause size={34} /> : <Play size={34} />}
              </button>
              <button type="button" className="ecouter-petit" onClick={() => deplacer(10)} aria-label="Avancer de 10 secondes">
                <RotateCw size={24} />
                <span>10</span>
              </button>
            </div>
            <button type="button" className="btn-texte ecouter-vitesse" onClick={changerVitesse}>
              Vitesse × {String(vitesse).replace(".", ",")}
            </button>
          </div>

          {erreurAudio && (
            <div className="ecouter-bloc">
              <Encadre ton="rouge">{erreurAudio}</Encadre>
            </div>
          )}

          <div className="ecouter-bloc">
            {hors ? (
              <p className="ecouter-enregistre">
                <CircleCheck size={20} />
                Enregistré sur cet appareil, disponible sans internet
              </p>
            ) : (
              <>
                <button type="button" className="btn-secondaire btn-large" onClick={telecharger} disabled={!enLigne || telechargement}>
                  <Download size={18} />
                  {telechargement ? "Téléchargement…" : "Enregistrer pour écouter sans internet"}
                </button>
                {preferences.wifiSeulement && <p className="texte-doux ecouter-note">Pensez à utiliser le Wi-Fi pour économiser vos données mobiles.</p>}
              </>
            )}
          </div>
        </>
      )}

      <h2 className="titre-section">Le texte de la fiche</h2>
      <p className="ecouter-texte">{article.contenu.replace(/^## /gm, "").replace(/^- /gm, "• ")}</p>
    </div>
  );
}
