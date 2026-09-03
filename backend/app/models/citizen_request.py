from sqlalchemy import Column, Integer, Float, String, Text, DateTime
from datetime import datetime

from backend.app.db.database import Base


class CitizenRequestDB(Base):

    __tablename__ = "citizen_requests"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    text = Column(
        Text,
        nullable=False
    )

    language = Column(
        String(20),
        default="en"
    )

    category = Column(
        String(100),
        nullable=True
    )

    confidence = Column(
        Float,
        nullable=True
    )

    district = Column(
        String(100),
        nullable=True
    )

    state = Column(
        String(100),
        nullable=True
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    priority_score = Column(
        Float,
        nullable=True
    )

    priority_level = Column(
        String(50),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )