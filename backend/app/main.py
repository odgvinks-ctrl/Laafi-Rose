from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import CORS_ORIGINS
from app.core.database import Base, engine
from app.routes import appointments, auth, health_centers, notifications, services, users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laafi Rose · Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Utilisateurs et profils"])
app.include_router(health_centers.router, prefix="/health-centers", tags=["Centres de santé"])
app.include_router(services.router, prefix="/services", tags=["Services"])
app.include_router(appointments.router, prefix="/appointments", tags=["Rendez-vous"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])


@app.get("/health")
def health():
    return {"status": "ok"}
