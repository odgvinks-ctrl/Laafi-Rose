from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    organisation = Column(String(120))
    url = Column(String(500))
    year = Column(Integer)

    document = relationship("Document", back_populates="sources")
