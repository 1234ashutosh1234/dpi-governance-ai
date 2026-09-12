from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.requests import (
    router as request_router
)

from backend.app.api.location import (
    router as location_router
)

from backend.app.api.priority import (
    router as priority_router
)

from backend.app.api.analytics import (
    router as analytics_router
)

from backend.app.api.hotspot import (
    router as hotspot_router
)

from backend.app.api.context_priority import (
    router as context_priority_router
)

from backend.app.api.recommendation import (
    router as recommendation_router
)


from backend.app.db.database import engine, Base

from backend.app.models.citizen_request import (
    CitizenRequestDB
)

from backend.app.models.district_indicator import (
    DistrictIndicator
)


Base.metadata.create_all(
    bind=engine
)


app = FastAPI(
    title="DPI Governance AI",
    description="AI-powered Digital Public Infrastructure and Governance Platform",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(request_router)

app.include_router(
    location_router
)

app.include_router(priority_router)

app.include_router(analytics_router)

app.include_router(hotspot_router)

app.include_router(
    context_priority_router
)

app.include_router(
    recommendation_router
)



@app.get("/")
def root():

    return {
        "message": "DPI Governance AI API is running",
        "status": "success"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }