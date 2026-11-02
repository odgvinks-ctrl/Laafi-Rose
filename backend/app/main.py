import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes import (
    alerts,
    appointments,
    assistant,
    audios,
    auth,
    centres,
    fiches,
    godmothers,
    patients,
    questionnaire,
    reminders,
    staff,
    stats,
    suivi,
    users,
    voice,
)
from app.tasks import background_loop
from config.config import CORS_ORIGINS

Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(background_loop())
    yield
    task.cancel()


app = FastAPI(
    title="Laafi Rose API",
    description="Prévention, orientation, suivi des patients et alertes médicales",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
app.include_router(fiches.router, prefix="/fiches", tags=["Fiches"])
app.include_router(audios.router, prefix="/audios", tags=["Audios"])
app.include_router(questionnaire.router, prefix="/questionnaire", tags=["Questionnaire"])
app.include_router(assistant.router, prefix="/assistant", tags=["Assistant"])
app.include_router(centres.router, prefix="/centres", tags=["Centres"])
app.include_router(appointments.router, prefix="/rendez-vous", tags=["Rendez-vous"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(suivi.router, prefix="/suivi", tags=["Suivi patient"])
app.include_router(alerts.router, prefix="/alertes", tags=["Alertes"])
app.include_router(staff.router, prefix="/soignant", tags=["Espace soignant"])
app.include_router(reminders.router, prefix="/rappels", tags=["Rappels"])
app.include_router(godmothers.router, prefix="/marraines", tags=["Marraines"])
app.include_router(voice.router, prefix="/voix", tags=["Laafi Voix"])
app.include_router(stats.router, prefix="/statistiques", tags=["Statistiques"])


@app.get("/")
def root():
    return {"status": "ok", "message": "Laafi Rose API"}
