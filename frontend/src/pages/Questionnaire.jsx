import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, CircleCheck, Lightbulb, RotateCcw, MapPin, Stethoscope } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import { questions } from "../data/questionnaire.js";
import "./Questionnaire.css";

const libelles = { vrai: "Vrai", faux: "Faux", nsp: "Je ne sais pas" };

export default function Questionnaire() {
  const [index, setIndex] = useState(-1);
  const [reponses, setReponses] = useState([]);

  const question = questions[index];
  const reponse = reponses[index];
  const fini = index >= questions.length;

  function estJuste(q, r) {
    return (r === "vrai" && q.vrai) || (r === "faux" && !q.vrai);
  }

  function repondre(valeur) {
    setReponses([...reponses.slice(0, index), valeur]);
  }

  function recommencer() {
    setReponses([]);
    setIndex(0);
  }

  if (index === -1) {
    return (
      <div className="page page-etroite questionnaire">
        <p className="surtitre">Questionnaire</p>
        <h1 className="page-titre">Vrai ou faux ? Testez ce que vous savez sur les cancers.</h1>
        <p className="page-sous-titre">{questions.length} affirmations, environ 3 minutes.</p>
        <div className="questionnaire-bloc">
          <Encadre Icone={Lock}>Ce questionnaire informe. Il n'évalue pas votre état de santé. Vos réponses ne sont ni envoyées ni enregistrées.</Encadre>
        </div>
        <button type="button" className="btn-principal btn-large questionnaire-bloc" onClick={() => setIndex(0)}>
          Commencer
        </button>
      </div>
    );
  }

  if (fini) {
    return (
      <div className="page page-etroite questionnaire">
        <p className="surtitre">Questionnaire terminé</p>
        <h1 className="page-titre">Les points clés à retenir</h1>
        <ul className="questionnaire-bilan">
          {questions.map((q, i) => {
            const juste = estJuste(q, reponses[i]);
            return (
              <li key={q.affirmation} className="carte">
                <span className={juste ? "badge badge-vert" : "badge badge-ambre"}>{juste ? "Bien compris" : "À revoir"}</span>
                <strong>{q.affirmation}</strong>
                <p>{q.explication}</p>
              </li>
            );
          })}
        </ul>
        <Encadre Icone={Stethoscope}>Vous avez une question sur votre santé ? Parlez-en à un soignant, c'est son rôle.</Encadre>
        <div className="questionnaire-fin">
          <Link to="/centres" className="btn-principal">
            <MapPin size={18} />
            Trouver un centre de dépistage
          </Link>
          <button type="button" className="btn-secondaire" onClick={recommencer}>
            <RotateCcw size={18} />
            Recommencer
          </button>
        </div>
      </div>
    );
  }

  const juste = reponse && estJuste(question, reponse);

  return (
    <div className="page page-etroite questionnaire">
      <p className="texte-doux">
        Question {index + 1} sur {questions.length}
      </p>
      <div className="questionnaire-barre" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={index + 1}>
        <span style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <h1 className="questionnaire-affirmation">{question.affirmation}</h1>

      {!reponse ? (
        <div className="questionnaire-choix">
          {Object.entries(libelles).map(([valeur, libelle]) => (
            <button key={valeur} type="button" className="btn-secondaire" onClick={() => repondre(valeur)}>
              {libelle}
            </button>
          ))}
        </div>
      ) : (
        <div className="questionnaire-bloc">
          <Encadre Icone={juste ? CircleCheck : Lightbulb} titre={`La bonne réponse : ${question.vrai ? "VRAI" : "FAUX"}`} ton={juste ? "vert" : "ambre"}>
            {question.explication}
          </Encadre>
          <p className="texte-doux questionnaire-votre">Votre réponse : {libelles[reponse]}</p>
          <button type="button" className="btn-principal btn-large" onClick={() => setIndex(index + 1)}>
            {index === questions.length - 1 ? "Voir les points clés" : "Question suivante"}
          </button>
        </div>
      )}
    </div>
  );
}
