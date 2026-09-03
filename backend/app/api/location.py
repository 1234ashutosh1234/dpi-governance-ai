from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.location_service import (
    reverse_geocode
)


router = APIRouter(
    prefix="/location",
    tags=["Location Intelligence"]
)


class LocationRequest(BaseModel):

    latitude: float

    longitude: float


@router.post("/reverse")
def reverse_location(
    request: LocationRequest
):

    result = reverse_geocode(
        request.latitude,
        request.longitude
    )


    if not result.get("success"):

        raise HTTPException(
            status_code=404,
            detail=result.get(
                "message",
                "Location not found"
            )
        )


    return result