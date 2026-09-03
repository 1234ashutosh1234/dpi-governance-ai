from fastapi import APIRouter

from backend.app.schemas.priority_schema import PriorityRequest

from backend.app.ml.priority_engine import (
    calculate_priority_score
)


router = APIRouter(
    prefix="/priority",
    tags=["AI Priority Engine"]
)


@router.post("/calculate")
def calculate_priority(request: PriorityRequest):

    result = calculate_priority_score(
        citizen_demand=request.citizen_demand,
        population_affected=request.population_affected,
        infrastructure_gap=request.infrastructure_gap,
        urgency=request.urgency,
        vulnerability=request.vulnerability
    )

    return result