from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.app.db.database import get_db

from backend.app.services.context_priority import (
    calculate_context_priority
)


router = APIRouter(
    prefix="/context-priority",
    tags=["Context-Aware Priority"]
)


@router.get("/district/{district}/category/{category}")
def context_priority(
    district: str,
    category: str,
    db: Session = Depends(get_db)
):

    return calculate_context_priority(
        db=db,
        district=district,
        category=category
    )