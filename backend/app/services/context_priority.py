from sqlalchemy.orm import Session

from backend.app.models.district_indicator import (
    DistrictIndicator
)

from backend.app.models.citizen_request import (
    CitizenRequestDB
)


def calculate_context_priority(
    db: Session,
    district: str,
    category: str
):

    # Find district information
    district_data = (
        db.query(DistrictIndicator)
        .filter(
            DistrictIndicator.district == district
        )
        .first()
    )

    if not district_data:

        return {
            "error": "District data not found",
            "district": district
        }

    # Count citizen requests for this category
    request_count = (
        db.query(CitizenRequestDB)
        .filter(
            CitizenRequestDB.district == district
        )
        .filter(
            CitizenRequestDB.category == category
        )
        .count()
    )

    # ------------------------------------------------
    # 1. Citizen demand score
    # ------------------------------------------------

    # Prototype normalization.
    # 5+ requests = maximum demand score.

    citizen_demand = min(
        request_count * 20,
        100
    )

    # ------------------------------------------------
    # 2. Population affected
    # ------------------------------------------------

    population_score = min(
        (
            district_data.population_density
            / 2000
        ) * 100,
        100
    )

    # ------------------------------------------------
    # 3. Infrastructure gap
    # ------------------------------------------------

    if category == "Water Supply":

        infrastructure_access = (
            district_data.water_access
        )

    elif category == "Electricity":

        infrastructure_access = (
            district_data.electricity_access
        )

    elif category == "Roads":

        infrastructure_access = (
            district_data.road_quality
        )

    elif category == "Healthcare":

        infrastructure_access = (
            district_data.healthcare_access
        )

    else:

        # Average infrastructure access
        infrastructure_access = (
            district_data.water_access
            + district_data.electricity_access
            + district_data.road_quality
            + district_data.healthcare_access
        ) / 4

    infrastructure_gap = (
        100 - infrastructure_access
    )

    # ------------------------------------------------
    # 4. Vulnerability
    # ------------------------------------------------

    vulnerability = (
        district_data.vulnerability
    )

    # ------------------------------------------------
    # 5. Urgency
    # ------------------------------------------------

    # Current prototype:
    # Higher infrastructure gap = higher urgency.

    urgency = infrastructure_gap

    # ------------------------------------------------
    # 6. Final priority score
    # ------------------------------------------------

    priority_score = (

        citizen_demand * 0.25

        + population_score * 0.15

        + infrastructure_gap * 0.30

        + urgency * 0.15

        + vulnerability * 0.15
    )

    priority_score = round(
        priority_score,
        2
    )

    # ------------------------------------------------
    # 7. Priority level
    # ------------------------------------------------

    if priority_score >= 80:

        priority_level = "Critical"

    elif priority_score >= 60:

        priority_level = "High"

    elif priority_score >= 40:

        priority_level = "Medium"

    else:

        priority_level = "Low"

    return {

        "district": district,

        "category": category,

        "citizen_requests": request_count,

        "population": district_data.population,

        "population_density": (
            district_data.population_density
        ),

        "infrastructure_access": round(
            infrastructure_access,
            2
        ),

        "infrastructure_gap": round(
            infrastructure_gap,
            2
        ),

        "vulnerability": vulnerability,

        "urgency": round(
            urgency,
            2
        ),

        "priority_score": priority_score,

        "priority_level": priority_level,

        "investment": (
            district_data.infrastructure_investment
        )
    }