import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ["DATABASE_URL"] = "sqlite:///./test_backend.db"
os.environ["JWT_SECRET"] = "test-secret-test-secret-test-secret-test-secret"
if os.path.exists("test_backend.db"):
    os.remove("test_backend.db")
