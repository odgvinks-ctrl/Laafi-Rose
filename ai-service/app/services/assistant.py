import time

from sqlalchemy.orm import Session

from app.core.database import now
from app.models import AiLog, ChatMessage, ChatSession
from app.services import generation, retrieval, safety


def reply(db: Session, session: ChatSession, question: str) -> ChatMessage:
    db.add(ChatMessage(session_id=session.id, role="user", content=question))
    session.last_activity_at = now()
    db.commit()

    started = time.perf_counter()
    sources, slugs, urgent, top_score, event = [], [], False, None, "reponse"

    if safety.is_urgent(question):
        content, urgent, event = safety.URGENT_REPLY, True, "urgence"
    elif safety.asks_diagnosis(question):
        content, event = safety.DIAGNOSIS_REPLY, "refus_diagnostic"
    else:
        hits = retrieval.search(db, question)
        if not hits:
            content, event = safety.NO_ANSWER, "sans_resultat"
        else:
            top_score = round(hits[0][1], 3)
            try:
                content = generation.answer(question, [e.content for e, _ in hits], session.language)
            except Exception as exc:
                db.add(AiLog(session_id=session.id, event="erreur", provider=generation.provider_name(), detail=str(exc)[:500]))
                db.commit()
                content, event = safety.NO_ANSWER, "erreur"
            for e, _ in hits:
                doc = e.document
                if doc.slug not in slugs:
                    slugs.append(doc.slug)
                    sources.extend(f"{s.organisation + ' — ' if s.organisation else ''}{s.title}" for s in doc.sources)
            sources = list(dict.fromkeys(sources))

    message = ChatMessage(session_id=session.id, role="assistant", content=content, sources=sources, document_slugs=slugs, is_urgent=urgent)
    db.add(message)
    db.commit()
    db.refresh(message)
    db.add(
        AiLog(
            session_id=session.id,
            message_id=message.id,
            event=event,
            provider=generation.provider_name(),
            latency_ms=int((time.perf_counter() - started) * 1000),
            top_score=top_score,
        )
    )
    db.commit()
    return message
