from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship

from app.database import Base
from app.utils import now


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    centre_id = Column(Integer, ForeignKey("centres.id"))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

    centre = relationship("Centre", back_populates="staff")


class Centre(Base):
    __tablename__ = "centres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(String(80))
    city = Column(String(80), index=True)
    district = Column(String(80))
    address = Column(Text)
    phone = Column(String(20))
    latitude = Column(Float)
    longitude = Column(Float)
    services = Column(Text, default="")
    hours = Column(Text)
    accepts_appointments = Column(Boolean, default=False)
    is_on_call = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=now)

    staff = relationship("User", back_populates="centre")
    slots = relationship("Slot", back_populates="centre", cascade="all, delete-orphan")
    reports = relationship("CentreReport", back_populates="centre", cascade="all, delete-orphan")


class CentreReport(Base):
    __tablename__ = "centre_reports"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=now)

    centre = relationship("Centre", back_populates="reports")


class Slot(Base):
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    service = Column(String(80))
    starts_at = Column(DateTime, nullable=False)
    is_taken = Column(Boolean, default=False)

    centre = relationship("Centre", back_populates="slots")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(20), unique=True, nullable=False, index=True)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    slot_id = Column(Integer, ForeignKey("slots.id"))
    service = Column(String(80), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    contact_method = Column(String(10), default="appel")
    language = Column(String(5), default="fr")
    status = Column(String(20), default="en_attente")
    created_at = Column(DateTime, default=now)

    centre = relationship("Centre")
    slot = relationship("Slot")


class Fiche(Base):
    __tablename__ = "fiches"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    category = Column(String(20), nullable=False)
    title = Column(String(150), nullable=False)
    summary = Column(Text)
    content = Column(Text)
    keywords = Column(Text, default="")
    sources = Column(Text, default="")
    reading_minutes = Column(Integer, default=4)
    reviewed_at = Column(DateTime)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)

    audios = relationship("Audio", back_populates="fiche", cascade="all, delete-orphan")


class Audio(Base):
    __tablename__ = "audios"

    id = Column(Integer, primary_key=True, index=True)
    fiche_id = Column(Integer, ForeignKey("fiches.id"))
    title = Column(String(150), nullable=False)
    language = Column(String(5), nullable=False)
    url = Column(Text)
    duration_seconds = Column(Integer)
    size_mb = Column(Float)
    status = Column(String(20), default="en_preparation")
    transcript = Column(Text)

    fiche = relationship("Fiche", back_populates="audios")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    position = Column(Integer, default=0)
    statement = Column(Text, nullable=False)
    answer = Column(String(5), nullable=False)
    explanation = Column(Text, nullable=False)
    key_point = Column(Text)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    centre_id = Column(Integer, ForeignKey("centres.id"), nullable=False)
    cancer_type = Column(String(80), nullable=False)
    treatment = Column(String(150))
    diagnosed_at = Column(DateTime)
    consent_recorded_at = Column(DateTime, nullable=False)
    language = Column(String(5), default="fr")
    companion_phone = Column(String(20))
    share_location_continuously = Column(Boolean, default=False)
    last_latitude = Column(Float)
    last_longitude = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)

    user = relationship("User", foreign_keys=[user_id])
    doctor = relationship("User", foreign_keys=[doctor_id])
    centre = relationship("Centre")
    sessions = relationship("TreatmentSession", back_populates="patient", cascade="all, delete-orphan")
    checks = relationship("DailyCheck", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")


class TreatmentSession(Base):
    __tablename__ = "treatment_sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    kind = Column(String(30), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    status = Column(String(20), default="prevue")
    reminder_sent = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="sessions")


class DailyCheck(Base):
    __tablename__ = "daily_checks"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    fever = Column(Boolean, default=False)
    bleeding = Column(Boolean, default=False)
    pain_level = Column(Integer, default=0)
    note = Column(Text)
    triggered_alert = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)

    patient = relationship("Patient", back_populates="checks")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    type = Column(String(20), nullable=False)
    symptom = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    channel = Column(String(10), default="internet")
    status = Column(String(20), default="envoyee")
    escalation_level = Column(Integer, default=0)
    escalated_centre_id = Column(Integer, ForeignKey("centres.id"))
    handled_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=now)
    received_at = Column(DateTime)
    handled_at = Column(DateTime)
    closed_at = Column(DateTime)

    patient = relationship("Patient", back_populates="alerts")
    escalated_centre = relationship("Centre")
    handled_by = relationship("User")
    events = relationship("AlertEvent", back_populates="alert", cascade="all, delete-orphan", order_by="AlertEvent.created_at")


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False)
    label = Column(String(150), nullable=False)
    created_at = Column(DateTime, default=now)

    alert = relationship("Alert", back_populates="events")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    kind = Column(String(20), nullable=False)
    language = Column(String(5), default="fr")
    channel = Column(String(10), default="sms")
    child_birth_year = Column(Integer)
    day_of_month = Column(Integer)
    next_at = Column(DateTime)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now)


class Godmother(Base):
    __tablename__ = "godmothers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(60), nullable=False)
    city = Column(String(80))
    languages = Column(String(30), default="fr")
    story = Column(Text)
    phone = Column(String(20))
    available = Column(Boolean, default=True)


class GodmotherRequest(Base):
    __tablename__ = "godmother_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    city = Column(String(80))
    language = Column(String(5), default="fr")
    godmother_id = Column(Integer, ForeignKey("godmothers.id"))
    status = Column(String(20), default="en_attente")
    created_at = Column(DateTime, default=now)


class SmsLog(Base):
    __tablename__ = "sms_logs"

    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(10), nullable=False)
    phone = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="envoye")
    created_at = Column(DateTime, default=now)
