import runpy

from fastapi.testclient import TestClient

from app.main import app

runpy.run_path("seed.py")
client = TestClient(app)
ADMIN = {"X-Admin-Key": "cle-test"}


def new_session():
    return client.post("/chat/sessions", json={"language": "fr"}).json()["id"]


def test_articles_publics():
    articles = client.get("/articles/").json()
    assert {a["slug"] for a in articles} == {"cancer-du-sein", "cancer-du-col"}
    assert articles[0]["sources"]


def test_reponse_sourcee():
    sid = new_session()
    r = client.post(f"/chat/sessions/{sid}/messages", json={"content": "Comment se passe le dépistage du col de l'utérus ?"})
    body = r.json()
    assert r.status_code == 201 and "cancer-du-col" in body["document_slugs"] and body["sources"]
    assert len(client.get(f"/chat/sessions/{sid}/messages").json()) == 2


def test_urgence_et_refus():
    sid = new_session()
    assert client.post(f"/chat/sessions/{sid}/messages", json={"content": "Je saigne beaucoup depuis ce matin"}).json()["is_urgent"]
    r = client.post(f"/chat/sessions/{sid}/messages", json={"content": "Est-ce que j'ai un cancer ?"}).json()
    assert "diagnostic" in r["content"]


def test_administration():
    assert client.get("/documents/").status_code == 403
    r = client.post("/documents/", headers=ADMIN, json={"slug": "cancer-du-foie", "title": "Cancer du foie", "category": "cancer", "content": "Souvent lié aux hépatites B et C."})
    assert r.status_code == 201
    assert client.post("/documents/cancer-du-foie/publier", headers=ADMIN, json={"reviewed_by": "Dr X"}).status_code == 400
    client.patch("/documents/cancer-du-foie", headers=ADMIN, json={"sources": [{"title": "Hépatite B", "organisation": "OMS"}]})
    r = client.post("/documents/cancer-du-foie/publier", headers=ADMIN, json={"reviewed_by": "Dr X"})
    assert r.json()["status"] == "publie" and r.json()["chunks"] >= 1
    assert client.get("/logs/resume", headers=ADMIN).json()["total"] >= 1
