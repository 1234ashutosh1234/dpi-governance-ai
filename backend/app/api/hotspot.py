from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.hotspot import (
    detect_hotspots
)


router = APIRouter(
    prefix="/hotspots",
    tags=["Geographic Hotspots"]
)


@router.get("/district/{district}")
def district_hotspots(
    district: str,
    db: Session = Depends(get_db)
):

    return detect_hotspots(
        db=db,
        district=district
    )