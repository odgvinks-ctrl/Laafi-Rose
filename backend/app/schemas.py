from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Role = Literal["patient", "medecin", "centre", "admin"]
Langue = Literal["fr", "mo", "dy"]


class Orm(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginIn(BaseModel):
    phone: str
    password: str


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=8, max_length=20)
    email: Optional[str] = None
    password: str = Field(min_length=8)
    role: Role
    centre_id: Optional[int] = None


class UserOut(Orm):
    id: int
    full_name: str
    phone: str
    email: Optional[str]
    role: str
    centre_id: Optional[int]


class CentreBase(BaseModel):
    name: str
    type: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    services: list[str] = []
    hours: Optional[str] = None
    accepts_appointments: bool = False
    is_on_call: bool = False
    verified: bool = False


class CentreCreate(CentreBase):
    pass


class CentreUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    services: Optional[list[str]] = None
    hours: Optional[str] = None
    accepts_appointments: Optional[bool] = None
    is_on_call: Optional[bool] = None
    verified: Optional[bool] = None


class CentreOut(CentreBase):
    id: int
    verified_at: Optional[datetime] = None
    distance_km: Optional[float] = None


class ReportIn(BaseModel):
    message: str = Field(min_length=3, max_length=1000)


class SlotCreate(BaseModel):
    service: Optional[str] = None
    starts_at: datetime


class SlotOut(Orm):
    id: int
    service: Optional[str]
    starts_at: datetime
    is_taken: bool


class AppointmentCreate(BaseModel):
    centre_id: int
    service: str
    slot_id: Optional[int] = None
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=8, max_length=20)
    contact_method: Literal["appel", "sms"] = "appel"
    language: Langue = "fr"
    consent: bool


class AppointmentStatusIn(BaseModel):
    status: Literal["en_attente", "confirme", "annule"]


class AppointmentOut(Orm):
    reference: str
    centre_id: int
    service: str
    status: str
    slot_id: Optional[int]
    created_at: datetime


class AudioOut(Orm):
    id: int
    fiche_id: Optional[int]
    title: str
    language: str
    url: Optional[str]
    duration_seconds: Optional[int]
    size_mb: Optional[float]
    status: str
    transcript: Optional[str]


class FicheBase(BaseModel):
    slug: str
    category: Literal["cancer", "facteur", "depistage"]
    title: str
    summary: Optional[str] = None
    content: Optional[str] = None
    keywords: str = ""
    sources: str = ""
    reading_minutes: int = 4
    is_published: bool = False


class FicheCreate(FicheBase):
    pass


class FicheUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    sources: Optional[str] = None
    reading_minutes: Optional[int] = None
    is_published: Optional[bool] = None


class FicheOut(FicheBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    reviewed_at: Optional[datetime]
    audios: list[AudioOut] = []


class QuestionOut(Orm):
    id: int
    position: int
    statement: str
    answer: str
    explanation: str
    key_point: Optional[str]


class AssistantIn(BaseModel):
    question: str = Field(min_length=2, max_length=500)
    langue: Langue = "fr"


class AssistantOut(BaseModel):
    urgence: bool
    reponse: str
    sources: list[str] = []
    fiches: list[str] = []


class PatientCreate(BaseModel):
    full_name: str
    phone: str = Field(min_length=8, max_length=20)
    cancer_type: str
    treatment: Optional[str] = None
    diagnosed_at: Optional[datetime] = None
    language: Langue = "fr"
    companion_phone: Optional[str] = None
    consent_recorded: bool


class PatientOut(Orm):
    id: int
    user: UserOut
    doctor_id: int
    centre_id: int
    cancer_type: str
    treatment: Optional[str]
    diagnosed_at: Optional[datetime]
    language: str
    companion_phone: Optional[str]
    is_active: bool


class PatientCreated(BaseModel):
    patient: PatientOut
    temporary_password: str


class SessionCreate(BaseModel):
    kind: Literal["chimiotherapie", "radiotherapie", "consultation", "examen", "controle"]
    scheduled_at: datetime


class SessionStatusIn(BaseModel):
    status: Literal["prevue", "honoree", "manquee", "annulee"]


class SessionOut(Orm):
    id: int
    kind: str
    scheduled_at: datetime
    status: str


class DailyCheckIn(BaseModel):
    fever: bool = False
    bleeding: bool = False
    pain_level: int = Field(default=0, ge=0, le=10)
    note: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class DailyCheckOut(Orm):
    id: int
    fever: bool
    bleeding: bool
    pain_level: int
    triggered_alert: bool
    created_at: datetime


class AlertCreate(BaseModel):
    type: Literal["bouton", "symptome"] = "bouton"
    symptom: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AlertEventOut(Orm):
    label: str
    created_at: datetime


class AlertOut(Orm):
    id: int
    patient_id: int
    type: str
    symptom: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    channel: str
    status: str
    escalation_level: int
    escalated_centre_id: Optional[int]
    handled_by_id: Optional[int]
    created_at: datetime
    events: list[AlertEventOut] = []


class AlertForStaff(AlertOut):
    patient_name: str
    patient_phone: str
    cancer_type: str
    treatment: Optional[str]


class MySuiviOut(BaseModel):
    patient: PatientOut
    doctor_name: str
    doctor_phone: str
    centre_name: str
    centre_phone: Optional[str]
    next_sessions: list[SessionOut]
    open_alerts: list[AlertOut]


class DashboardOut(BaseModel):
    patients_suivis: int
    alertes_ouvertes: int
    seances_aujourdhui: int
    seances_manquees_7j: int
    delai_moyen_reponse_min: Optional[float]
    taux_seances_honorees: Optional[float]


class ReminderCreate(BaseModel):
    phone: str = Field(min_length=8, max_length=20)
    kind: Literal["vaccin_hpv", "hepatite_b", "autopalpation"]
    language: Langue = "fr"
    channel: Literal["sms", "vocal"] = "sms"
    child_birth_year: Optional[int] = None
    day_of_month: Optional[int] = Field(default=None, ge=1, le=28)


class ReminderOut(Orm):
    id: int
    phone: str
    kind: str
    language: str
    channel: str
    next_at: Optional[datetime]
    active: bool


class GodmotherOut(Orm):
    id: int
    first_name: str
    city: Optional[str]
    languages: str
    story: Optional[str]
    available: bool


class GodmotherCreate(BaseModel):
    first_name: str
    city: Optional[str] = None
    languages: str = "fr"
    story: Optional[str] = None
    phone: Optional[str] = None


class GodmotherRequestIn(BaseModel):
    name: str
    phone: str = Field(min_length=8, max_length=20)
    city: Optional[str] = None
    language: Langue = "fr"


class GodmotherRequestOut(Orm):
    id: int
    status: str
    created_at: datetime


class IncomingSms(BaseModel):
    phone: str
    message: str


class StatsOut(BaseModel):
    orientations_rendez_vous: int
    rendez_vous_par_ville: dict[str, int]
    patients_suivis: int
    patients_par_cancer: dict[str, int]
    alertes_total: int
    alertes_par_type: dict[str, int]
    delai_moyen_reponse_min: Optional[float]
    rappels_actifs: int
