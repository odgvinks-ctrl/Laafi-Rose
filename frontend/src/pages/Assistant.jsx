import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SendHorizontal, TriangleAlert, MapPin, BookOpen, WifiOff, Info } from "lucide-react";
import Encadre from "../components/Encadre.jsx";
import { demarrerConversation, poserQuestion } from "../api/assistant.js";
import { articleEnCache } from "../api/articles.js";
import { usePreferences } from "../context/PreferencesContext.jsx";
import { useEnLigne } from "../hooks/useEnLigne.js";
import "./Assistant.css";

const suggestions = ["Quels sont les signes du cancer du sein ?", "Où faire un dépistage du col ?", "Comment s'examiner les seins ?"];

export default function Assistant() {
  const enLigne = useEnLigne();
  const { preferences } = usePreferences();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [saisie, setSaisie] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const fin = useRef(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, envoi]);

  async function envoyer(texte) {
    const question = texte.trim();
    if (question.length < 2 || envoi) return;

    setMessages((liste) => [...liste, { id: `q-${Date.now()}`, role: "user", content: question }]);
    setSaisie("");
    setEnvoi(true);

    try {
      const id = session || (await demarrerConversation(preferences.langueAudio));
      setSession(id);
      const reponse = await poserQuestion(id, question);
      setMessages((liste) => [...liste, reponse]);
    } catch (e) {
      setMessages((liste) => [...liste, { id: `e-${Date.now()}`, role: "assistant", content: e.message, erreur: true }]);
    } finally {
      setEnvoi(false);
    }
  }

  function soumettre(e) {
    e.preventDefault();
    envoyer(saisie);
  }

  return (
    <div className="page page-etroite assistant">
      <div className="assistant-entete">
        <h1 className="page-titre">Assistant</h1>
        <p className="texte-doux">Informations générales · ne remplace pas un soignant</p>
      </div>

      {!enLigne ? (
        <div className="pile">
          <Encadre Icone={WifiOff} titre="L'assistant a besoin d'internet" ton="sable">
            En attendant, vos fiches enregistrées restent lisibles. En cas de saignement important, de forte fièvre ou de douleur intense, rendez-vous au centre de santé le plus proche.
          </Encadre>
          <Link to="/enregistres" className="btn-secondaire">
            Voir mes fiches enregistrées
          </Link>
        </div>
      ) : (
        <>
          <div className="assistant-fil" aria-live="polite">
            <div className="bulle bulle-assistant">
              Bonjour ! Je réponds à vos questions sur les cancers à partir de fiches validées par des soignants. Je ne pose pas de diagnostic : pour votre situation personnelle, un soignant reste la bonne personne.
            </div>

            {messages.map((m) =>
              m.is_urgent ? (
                <div key={m.id} className="assistant-urgent">
                  <Encadre Icone={TriangleAlert} titre="Cette situation demande un avis médical rapide" ton="rouge">
                    {m.content}
                  </Encadre>
                  <Link to="/centres" className="btn-principal">
                    <MapPin size={18} />
                    Trouver un centre proche
                  </Link>
                </div>
              ) : (
                <div key={m.id} className={m.role === "user" ? "message message-moi" : "message"}>
                  <div className={m.role === "user" ? "bulle bulle-moi" : m.erreur ? "bulle bulle-erreur" : "bulle bulle-assistant"}>{m.content}</div>
                  {m.sources?.length > 0 && <p className="message-sources">Sources : {m.sources.join(" · ")}</p>}
                  {m.document_slugs?.length > 0 && (
                    <div className="rangee">
                      {m.document_slugs.map((slug) => (
                        <Link key={slug} to={`/sinformer/${slug}`} className="puce">
                          <BookOpen size={16} />
                          {articleEnCache(slug)?.titre || "Lire la fiche"}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}

            {envoi && <p className="assistant-ecrit">L'assistant écrit…</p>}
            <div ref={fin} />
          </div>

          <div className="assistant-saisie">
            {!messages.length && (
              <div className="puces">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="puce" onClick={() => envoyer(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form className="assistant-formulaire" onSubmit={soumettre}>
              <input type="text" value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Votre question" aria-label="Votre question" maxLength={1000} />
              <button type="submit" className="assistant-envoyer" disabled={envoi || saisie.trim().length < 2} aria-label="Envoyer">
                <SendHorizontal size={20} />
              </button>
            </form>
            <p className="assistant-note">
              <Info size={14} />
              Ne partagez pas d'informations personnelles (nom, numéro, résultats d'examens).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
