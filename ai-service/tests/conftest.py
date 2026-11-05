import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./test_ai.db"
os.environ["ADMIN_API_KEY"] = "cle-test"
os.environ["JWT_SECRET"] = "test-secret-test-secret-test-secret-test-secret"
if os.path.exists("test_ai.db"):
    os.remove("test_ai.db")
