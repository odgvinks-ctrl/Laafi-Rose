from datetime import datetime
from typing import Optional

from app.schemas.common import Orm


class NotificationOut(Orm):
    id: int
    type: str
    title: str
    body: Optional[str]
    link: Optional[str]
    read_at: Optional[datetime]
    created_at: datetime
