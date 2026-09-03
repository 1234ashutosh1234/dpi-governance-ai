def calculate_priority_score(
    citizen_demand: float,
    population_affected: float,
    infrastructure_gap: float,
    urgency: float,
    vulnerability: float
):
    """
    Calculate infrastructure development priority score.

    All input values should be between 0 and 100.
    """

    # Weighted scoring model
    demand_score = citizen_demand * 0.25

    population_score = population_affected * 0.20

    infrastructure_score = infrastructure_gap * 0.25

    urgency_score = urgency * 0.20

    vulnerability_score = vulnerability * 0.10

    total_score = (
        demand_score
        + population_score
        + infrastructure_score
        + urgency_score
        + vulnerability_score
    )

    total_score = round(total_score, 2)

    # Priority classification
    if total_score >= 80:
        priority = "Critical"

    elif total_score >= 60:
        priority = "High"

    elif total_score >= 40:
        priority = "Medium"

    else:
        priority = "Low"

    return {
        "priority_score": total_score,
        "priority_level": priority
    }