import runpy

from fastapi.testclient import TestClient

from app.main import app

runpy.run_path("seed.py")
client = TestClient(app)


def auth(phone, password):
    r = client.post("/auth/login", json={"phone": phone, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_inscription_et_profil():
    r = client.post("/auth/register", json={"phone": "+22671234567", "password": "motdepasse1", "first_name": "Aminata", "language": "mo"})
    assert r.status_code == 201, r.text
    headers = {"Authorization": f"Bearer {r.json()['access_token']}"}
    me = client.get("/users/me", headers=headers).json()
    assert me["role"]["code"] == "utilisateur" and me["profile"]["language"] == "mo"
    r = client.patch("/users/me/profile", headers=headers, json={"text_size": "grand"})
    assert r.json()["text_size"] == "grand"


def test_centres_et_rendez_vous():
    centres = client.get("/health-centers/", params={"lat": 12.37, "lng": -1.52, "category": "depistage_col"}).json()
    assert centres and centres[0]["distance_km"] is not None
    centre = centres[0]
    service = centre["services"][0]
    user = auth("+22671234567", "motdepasse1")
    r = client.post("/appointments/", headers=user, json={"health_center_id": centre["id"], "service_id": service["id"], "name": "Aminata", "phone": "+22671234567", "consent": True})
    assert r.status_code == 201, r.text
    ref = r.json()["reference"]

    staff = auth("+22670000002", "centre12345")
    assert client.get("/notifications/", headers=staff).json()
    r = client.patch(f"/appointments/{ref}", headers=staff, json={"status": "confirme"})
    assert r.json()["status"] == "confirme"
    notes = client.get("/notifications/", headers=user).json()
    assert notes[0]["title"] == "Votre rendez-vous est confirmé"
    assert client.get(f"/appointments/{ref}", params={"phone": "+22671234567"}).status_code == 200
