import os
from dotenv import load_dotenv

load_dotenv()

APP_NAME = "Laafi Rose"
DATABASE_URL = os.getenv("DATABASE_URL")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

ALERT_ESCALATION_MINUTES = int(os.getenv("ALERT_ESCALATION_MINUTES", "10"))
ALERT_CHECK_SECONDS = int(os.getenv("ALERT_CHECK_SECONDS", "60"))
EMERGENCY_PHONE = os.getenv("EMERGENCY_PHONE", "")

SMS_PROVIDER = os.getenv("SMS_PROVIDER", "console")
SMS_API_URL = os.getenv("SMS_API_URL", "")
SMS_API_KEY = os.getenv("SMS_API_KEY", "")
SMS_SENDER = os.getenv("SMS_SENDER", "LaafiRose")
