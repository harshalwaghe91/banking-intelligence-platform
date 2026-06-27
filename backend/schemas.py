"""Pydantic request and response models."""

from pydantic import BaseModel, Field, field_validator


class CustomerInput(BaseModel):
    CreditScore: int = Field(..., ge=300, le=850)
    Geography: str
    Gender: str
    Age: int = Field(..., ge=18, le=100)
    Tenure: int = Field(..., ge=0, le=10)
    Balance: float = Field(..., ge=0)
    NumOfProducts: int = Field(..., ge=1, le=4)
    HasCrCard: int = Field(..., ge=0, le=1)
    IsActiveMember: int = Field(..., ge=0, le=1)
    EstimatedSalary: float = Field(..., ge=0)

    @field_validator("Geography")
    @classmethod
    def validate_geography(cls, value: str) -> str:
        normalized = value.strip().title()
        if normalized not in {"France", "Germany", "Spain"}:
            raise ValueError("Geography must be France, Germany, or Spain")
        return normalized

    @field_validator("Gender")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        normalized = value.strip().title()
        if normalized not in {"Male", "Female"}:
            raise ValueError("Gender must be Male or Female")
        return normalized


class PredictionResponse(BaseModel):
    customer_id: int | None = None
    external_customer_id: str | None = None
    churn_prediction: int
    churn_label: str
    churn_probability: float
    risk_category: str
    customer_segment: str
    explainable_reasons: list[str]
    retention_recommendations: list[str]


class ReportRequest(BaseModel):
    customer: CustomerInput
    prediction: PredictionResponse | None = None


class CustomerAssessmentResponse(BaseModel):
    customer: dict
    prediction: PredictionResponse
