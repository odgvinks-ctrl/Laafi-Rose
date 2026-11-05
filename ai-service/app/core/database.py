from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import DATABASE_URL, IS_POSTGRES

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def init_db():
    if IS_POSTGRES:
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    from app import models
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
