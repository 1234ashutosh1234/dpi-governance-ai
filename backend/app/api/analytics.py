from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.analytics import (
    get_district_analytics
)


router = APIRouter(
    prefix="/analytics",
    tags=["District Analytics"]
)


@router.get("/district/{district}")
def district_analytics(
    district: str,
    db: Session = Depends(get_db)
):

    return get_district_analytics(
        db=db,
        district=district
    )