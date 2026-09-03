from sqlalchemy import Column, Integer, Float, String

from backend.app.db.database import Base


class DistrictIndicator(Base):

    __tablename__ = "district_indicators"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    district = Column(
        String(100),
        nullable=False,
        index=True
    )

    state = Column(
        String(100),
        nullable=False
    )

    population = Column(
        Integer,
        nullable=False
    )

    population_density = Column(
        Float,
        nullable=False
    )

    literacy_rate = Column(
        Float,
        nullable=False
    )

    water_access = Column(
        Float,
        nullable=False
    )

    electricity_access = Column(
        Float,
        nullable=False
    )

    road_quality = Column(
        Float,
        nullable=False
    )

    healthcare_access = Column(
        Float,
        nullable=False
    )

    vulnerability = Column(
        Float,
        nullable=False
    )

    infrastructure_investment = Column(
        Float,
        nullable=False
    )