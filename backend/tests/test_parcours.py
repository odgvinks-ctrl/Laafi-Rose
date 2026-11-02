import runpy

from fastapi.testclient import TestClient

from app.main import app

runpy.run_path("seed.py")
client = TestClient(app)


def token(phone, password):
    r = client.post("/auth/login", json={"phone": phone, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_public():
    assert client.get("/fiches/").status_code == 200
    centres = client.get("/centres/", params={"lat": 12.37, "lng": -1.52}).json()
    assert centres[0]["distance_km"] is not None
    r = client.post("/rendez-vous/", json={"centre_id": centres[0]["id"], "service": "Dépistage du col", "name": "Aminata", "phone": "70123456", "consent": True})
    assert r.status_code == 201 and r.json()["status"] == "en_attente"
    assert client.post("/assistant/", json={"question": "Je saigne beaucoup"}).json()["urgence"] is True


def test_suivi_et_alerte():
    medecin = token("+22670000001", "medecin12345")
    r = client.post("/patients/", headers=medecin, json={"full_name": "Patiente Test", "phone": "+22671111111", "cancer_type": "Sein", "treatment": "Chimiothérapie", "consent_recorded": True})
    assert r.status_code == 201, r.text
    code = r.json()["temporary_password"]
    patient = token("+22671111111", code)

    r = client.post("/alertes/", headers=patient, json={"type": "bouton", "latitude": 12.37, "longitude": -1.52})
    assert r.status_code == 201
    alert_id = r.json()["id"]

    alertes = client.get("/alertes/", headers=medecin).json()
    assert any(a["id"] == alert_id for a in alertes)
    r = client.post(f"/alertes/{alert_id}/prise-en-charge", headers=medecin)
    assert r.json()["status"] == "prise_en_charge"

    r = client.post("/suivi/etat-du-jour", headers=patient, json={"fever": True})
    assert r.json()["triggered_alert"] is True
    assert client.get("/soignant/tableau-de-bord", headers=medecin).json()["alertes_ouvertes"] >= 1


def test_escalade():
    from app.database import SessionLocal
    from app.services.alert_service import escalate_pending_alerts

    db = SessionLocal()
    assert escalate_pending_alerts(db) >= 1
    db.close()


def test_sms_aide():
    r = client.post("/voix/sms-entrant", json={"phone": "+22671111111", "message": "AIDE douleur"})
    assert r.json()["action"] == "alerte"
