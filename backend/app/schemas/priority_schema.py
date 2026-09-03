from pydantic import BaseModel, Field


class PriorityRequest(BaseModel):

    citizen_demand: float = Field(
        ...,
        ge=0,
        le=100
    )

    population_affected: float = Field(
        ...,
        ge=0,
        le=100
    )

    infrastructure_gap: float = Field(
        ...,
        ge=0,
        le=100
    )

    urgency: float = Field(
        ...,
        ge=0,
        le=100
    )

    vulnerability: float = Field(
        ...,
        ge=0,
        le=100
    )