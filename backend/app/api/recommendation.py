from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.recommendation import (
    generate_recommendation
)


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"]
)


@router.get(
    "/district/{district}/category/{category}"
)
def recommendation(
    district: str,
    category: str,
    db: Session = Depends(get_db)
):

    return generate_recommendation(
        db=db,
        district=district,
        category=category
    )