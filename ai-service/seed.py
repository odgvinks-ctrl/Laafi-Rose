from app.core.database import SessionLocal, init_db, now
from app.models import Document, Source
from app.services.indexing import index_document

init_db()
db = SessionLocal()

DOCS = [
    {
        "slug": "cancer-du-sein",
        "title": "Cancer du sein",
        "category": "cancer",
        "summary": "Les signes à connaître, l'examen des seins et le dépistage.",
        "content": "Le cancer du sein est le cancer le plus fréquent chez les femmes. Il peut aussi toucher les hommes, plus rarement.\n\nMontrez-vous à un soignant si vous remarquez une boule ou un épaississement dans le sein ou sous le bras, un changement de forme ou de la peau, un mamelon qui se rétracte ou un écoulement inhabituel.\n\nCes signes ont le plus souvent une autre cause qu'un cancer, mais seul un examen permet de le savoir. Connaître l'aspect habituel de ses seins aide à repérer un changement.",
        "reading_minutes": 6,
        "sources": [{"title": "Cancer du sein, aide-mémoire", "organisation": "OMS"}],
    },
    {
        "slug": "cancer-du-col",
        "title": "Cancer du col de l'utérus",
        "category": "cancer",
        "summary": "Un cancer que l'on peut prévenir grâce au vaccin et au dépistage.",
        "content": "La plupart des cancers du col de l'utérus sont liés à une infection durable par certains papillomavirus humains (HPV).\n\nLe vaccin contre le HPV, recommandé aux filles de 9 à 14 ans, protège contre les virus le plus souvent en cause.\n\nLe dépistage, par inspection visuelle (IVA) ou test HPV, permet de repérer des lésions avant qu'elles ne deviennent un cancer. Il est gratuit dans les centres de santé et les cliniques mobiles.",
        "reading_minutes": 5,
        "sources": [{"title": "Cancer du col de l'utérus, aide-mémoire", "organisation": "OMS"}],
    },
]

for d in DOCS:
    if db.query(Document).filter(Document.slug == d["slug"]).first():
        continue
    sources = d.pop("sources")
    doc = Document(**d, status="publie", reviewed_by="Contenu d'exemple, à faire valider", reviewed_at=now())
    doc.sources = [Source(**s) for s in sources]
    db.add(doc)
    db.commit()
    index_document(db, doc)

db.close()
print("Documents de démonstration indexés.")
