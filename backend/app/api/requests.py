from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.request_schema import CitizenRequest
from backend.app.ml.classifier import classify_request
from backend.app.db.database import get_db
from backend.app.models.citizen_request import CitizenRequestDB


router = APIRouter(
    prefix="/requests",
    tags=["Citizen Requests"]
)


@router.post("/analyze")
def analyze_request(
    request: CitizenRequest,
    db: Session = Depends(get_db)
):

    # 1. Analyze citizen request using AI
    result = classify_request(request.text)

    # 2. Create database record
    db_request = CitizenRequestDB(
        text=request.text,
        language=request.language,
        category=result["category"],
        confidence=result["confidence"],
        district=request.district,
        state=request.state,
        latitude=request.latitude,
        longitude=request.longitude
    )

    # 3. Save request
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # 4. Return result
    return {
        "id": db_request.id,
        "original_text": request.text,
        "language": request.language,
        "location": {
            "district": request.district,
            "state": request.state,
            "latitude": request.latitude,
            "longitude": request.longitude
        },
        "analysis": result,
        "database_status": "saved"
    }


@router.get("/")
def get_all_requests(
    db: Session = Depends(get_db)
):

    requests = (
        db.query(CitizenRequestDB)
        .order_by(CitizenRequestDB.created_at.desc())
        .all()
    )

    return requests


@router.get("/district/{district}")
def get_district_requests(
    district: str,
    db: Session = Depends(get_db)
):

    requests = (
        db.query(CitizenRequestDB)
        .filter(
            CitizenRequestDB.district == district
        )
        .order_by(
            CitizenRequestDB.created_at.desc()
        )
        .all()
    )

    return requests