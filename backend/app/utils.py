import math
import secrets
import string
from datetime import datetime, timezone


def now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def distance_km(lat1, lng1, lat2, lng2):
    if None in (lat1, lng1, lat2, lng2):
        return None
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 1)


def reference(prefix="LR"):
    alphabet = string.ascii_uppercase + string.digits
    return f"{prefix}-" + "".join(secrets.choice(alphabet) for _ in range(8))


def temporary_password():
    return "".join(secrets.choice(string.digits) for _ in range(6))
