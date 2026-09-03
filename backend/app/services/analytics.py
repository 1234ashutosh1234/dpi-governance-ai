from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.citizen_request import CitizenRequestDB


def get_district_analytics(
    db: Session,
    district: str
):

    # Get total number of requests
    total_requests = (
        db.query(
            func.count(CitizenRequestDB.id)
        )
        .filter(
            CitizenRequestDB.district == district
        )
        .scalar()
    )

    # Get requests grouped by category
    category_results = (
        db.query(
            CitizenRequestDB.category,
            func.count(CitizenRequestDB.id)
        )
        .filter(
            CitizenRequestDB.district == district
        )
        .group_by(
            CitizenRequestDB.category
        )
        .order_by(
            func.count(
                CitizenRequestDB.id
            ).desc()
        )
        .all()
    )

    category_breakdown = []

    for category, count in category_results:

        percentage = 0

        if total_requests > 0:
            percentage = round(
                (count / total_requests) * 100,
                2
            )

        category_breakdown.append({
            "category": category,
            "requests": count,
            "percentage": percentage
        })

    # Determine top problem
    top_problem = None

    if category_breakdown:
        top_problem = category_breakdown[0]["category"]

    # Determine demand level
    if total_requests >= 50:
        demand_level = "Critical"

    elif total_requests >= 20:
        demand_level = "High"

    elif total_requests >= 10:
        demand_level = "Medium"

    else:
        demand_level = "Low"

    return {
        "district": district,
        "total_requests": total_requests,
        "demand_level": demand_level,
        "top_problem": top_problem,
        "category_breakdown": category_breakdown
    }