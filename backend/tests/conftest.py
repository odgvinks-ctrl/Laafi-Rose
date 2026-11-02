import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./test_laafi.db"
os.environ.setdefault("JWT_SECRET", "test-secret-test-secret-test-secret-test-secret")
os.environ["SMS_PROVIDER"] = "console"
os.environ["ALERT_ESCALATION_MINUTES"] = "0"
os.environ["ALERT_CHECK_SECONDS"] = "3600"

if os.path.exists("test_laafi.db"):
    os.remove("test_laafi.db")
