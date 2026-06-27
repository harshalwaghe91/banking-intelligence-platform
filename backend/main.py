"""FastAPI application for the Banking Intelligence Platform."""

from __future__ import annotations

import io
import os
from pathlib import Path
from typing import Annotated

import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

from database import (
    fetch_customers,
    get_customer_profile,
    init_db,
    list_reports,
    save_prediction,
    search_customer_profiles,
    seed_customer_profiles,
)
from prediction import predict_customer, predict_customers_batch
from report_generator import REPORTS_DIR, generate_customer_report
from schemas import CustomerAssessmentResponse, CustomerInput, PredictionResponse, ReportRequest
from train_model import DATA_PATH, FEATURE_COLUMNS, load_or_create_data

app = FastAPI(
    title="AI-Powered Banking Intelligence API",
    version="1.0.0",
    description="Churn prediction, explainability, segmentation, analytics, and retention intelligence.",
)
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=os.getenv(
        "ALLOWED_ORIGIN_REGEX",
        r"https://banking-intelligence-platform(?:-[a-z0-9-]+)?\.vercel\.app",
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    init_db()
    customer_data = load_or_create_data()
    seed_customer_profiles(customer_data[FEATURE_COLUMNS].to_dict(orient="records"))
    REPORTS_DIR.mkdir(exist_ok=True)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "AI-Powered Banking Intelligence API is running."}


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "healthy",
        "service": "banking-intelligence-api",
        "environment": os.getenv("APP_ENV", "development"),
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: CustomerInput) -> dict:
    customer = payload.model_dump()
    try:
        result = predict_customer(customer)
        result["customer_id"] = save_prediction(customer, result)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.get("/customer-directory")
def customer_directory(
    search: str | None = None,
    geography: str | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 25,
) -> dict:
    """Search customers already present in the bank's customer master."""
    return {
        "customers": search_customer_profiles(search=search, geography=geography, limit=limit)
    }


@app.get("/customer-directory/{customer_id}")
def customer_detail(customer_id: str) -> dict:
    customer = get_customer_profile(customer_id.upper())
    if not customer:
        raise HTTPException(status_code=404, detail="Customer was not found.")
    return customer


@app.post("/customer-directory/{customer_id}/assess", response_model=CustomerAssessmentResponse)
def assess_existing_customer(customer_id: str) -> dict:
    """Run an assessment using authoritative customer data, not user-entered model fields."""
    customer = get_customer_profile(customer_id.upper())
    if not customer:
        raise HTTPException(status_code=404, detail="Customer was not found.")
    try:
        features = CustomerInput(**customer["model_features"]).model_dump()
        result = predict_customer(features)
        result["external_customer_id"] = customer["customer_id"]
        result["customer_id"] = save_prediction(
            features, result, external_customer_id=customer["customer_id"]
        )
        return {"customer": customer, "prediction": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {exc}") from exc


@app.post("/batch-predict")
async def batch_predict(file: UploadFile = File(...)) -> StreamingResponse:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")
    try:
        content = await file.read()
        frame = pd.read_csv(io.BytesIO(content))
        missing = set(FEATURE_COLUMNS) - set(frame.columns)
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing columns: {sorted(missing)}")
        if len(frame) > 10_000:
            raise HTTPException(status_code=400, detail="CSV files are limited to 10,000 rows.")
        output = frame.copy()
        validated_rows = [
            CustomerInput(**row).model_dump()
            for row in frame[FEATURE_COLUMNS].to_dict(orient="records")
        ]
        results = predict_customers_batch(pd.DataFrame(validated_rows))
        output["ChurnPrediction"] = [item["churn_prediction"] for item in results]
        output["ChurnProbability"] = [item["churn_probability"] for item in results]
        output["RiskCategory"] = [item["risk_category"] for item in results]
        output["CustomerSegment"] = [item["customer_segment"] for item in results]
        output["TopReason"] = [item["top_reason"] for item in results]
        output["Recommendation"] = [item["recommendation"] for item in results]
        buffer = io.StringIO()
        output.to_csv(buffer, index=False)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="customer_churn_predictions.csv"'},
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not process CSV: {exc}") from exc


def _analytics_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        load_or_create_data()
    return pd.read_csv(DATA_PATH)


@app.get("/analytics")
def analytics() -> dict:
    data = _analytics_data()
    total = len(data)
    churned = int(data["Exited"].sum())

    def grouped(column: str) -> list[dict]:
        grouped_data = data.groupby(column, observed=False)["Exited"].agg(["count", "sum", "mean"]).reset_index()
        return [
            {
                "name": str(row[column]),
                "customers": int(row["count"]),
                "churned": int(row["sum"]),
                "churn_rate": round(float(row["mean"]) * 100, 2),
            }
            for _, row in grouped_data.iterrows()
        ]

    age_labels = ["18-30", "31-40", "41-50", "51-60", "61+"]
    data["AgeGroup"] = pd.cut(
        data["Age"], bins=[17, 30, 40, 50, 60, 120], labels=age_labels
    )
    return {
        "total_customers": total,
        "churned_customers": churned,
        "retained_customers": total - churned,
        "churn_rate": round(churned / total * 100, 2),
        "high_risk_customers": int(((data["Exited"] == 1) & (data["IsActiveMember"] == 0)).sum()),
        "geography_wise_churn": grouped("Geography"),
        "gender_wise_churn": grouped("Gender"),
        "age_group_churn": grouped("AgeGroup"),
        "active_member_churn": grouped("IsActiveMember"),
        "product_wise_churn": grouped("NumOfProducts"),
    }


@app.get("/customers")
def customers(
    risk_level: str | None = None,
    geography: str | None = None,
    gender: str | None = None,
    churn_status: Annotated[int | None, Query(ge=0, le=1)] = None,
    search: str | None = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 250,
) -> dict:
    return {
        "customers": fetch_customers(risk_level, geography, gender, churn_status, search, limit)
    }


@app.get("/segments")
def segments() -> dict:
    data = _analytics_data()
    # Business-readable segment analysis mirrors the model's four personas.
    conditions = [
        data["Balance"] >= data["Balance"].quantile(0.75),
        (data["Exited"] == 1) | (data["IsActiveMember"] == 0),
        data["Tenure"] <= 2,
    ]
    labels = ["Premium Customers", "At-Risk Customers", "New Customers"]
    data["Segment"] = "Loyal Customers"
    for condition, label in zip(conditions, labels):
        data.loc[condition, "Segment"] = label

    descriptions = {
        "Loyal Customers": "Established, engaged customers with stable relationships.",
        "At-Risk Customers": "Customers showing inactivity or historical churn signals.",
        "Premium Customers": "High-value customers with significant balances.",
        "New Customers": "Early-tenure customers still forming product habits.",
    }
    items = []
    for name in descriptions:
        subset = data[data["Segment"] == name]
        items.append(
            {
                "name": name,
                "count": len(subset),
                "percentage": round(len(subset) / len(data) * 100, 1),
                "average_balance": round(float(subset["Balance"].mean()), 2) if len(subset) else 0,
                "churn_rate": round(float(subset["Exited"].mean()) * 100, 2) if len(subset) else 0,
                "description": descriptions[name],
            }
        )
    return {"segments": items, "total_customers": len(data)}


@app.post("/generate-report")
def generate_report(request: ReportRequest) -> dict:
    customer = request.customer.model_dump()
    prediction = request.prediction.model_dump() if request.prediction else predict_customer(customer)
    try:
        filename = generate_customer_report(customer, prediction)
        return {
            "filename": filename,
            "download_url": f"/download-report/{filename}",
            "message": "Report generated successfully.",
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {exc}") from exc


@app.get("/reports")
def reports() -> dict:
    return {"reports": list_reports()}


@app.get("/download-report/{filename}")
def download_report(filename: str) -> FileResponse:
    safe_name = Path(filename).name
    path = REPORTS_DIR / safe_name
    if not path.exists() or path.suffix.lower() != ".pdf":
        raise HTTPException(status_code=404, detail="Report not found.")
    return FileResponse(path, media_type="application/pdf", filename=safe_name)
