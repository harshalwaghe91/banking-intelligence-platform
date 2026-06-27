"""Model loading, prediction, segmentation, and local explanations."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd

from recommendation import generate_recommendations
from train_model import FEATURE_COLUMNS, MODEL_DIR, SEGMENT_COLUMNS, train

_artifacts: dict[str, Any] = {}


def ensure_models() -> None:
    required = [
        MODEL_DIR / "churn_model.pkl",
        MODEL_DIR / "encoder.pkl",
        MODEL_DIR / "kmeans_model.pkl",
        MODEL_DIR / "segment_scaler.pkl",
        MODEL_DIR / "metadata.json",
    ]
    if not all(path.exists() for path in required):
        train()


def load_artifacts() -> dict[str, Any]:
    if not _artifacts:
        ensure_models()
        _artifacts.update(
            {
                "model": joblib.load(MODEL_DIR / "churn_model.pkl"),
                "preprocessor": joblib.load(MODEL_DIR / "encoder.pkl"),
                "kmeans": joblib.load(MODEL_DIR / "kmeans_model.pkl"),
                "segment_scaler": joblib.load(MODEL_DIR / "segment_scaler.pkl"),
                "metadata": json.loads((MODEL_DIR / "metadata.json").read_text(encoding="utf-8")),
            }
        )
    return _artifacts


def risk_from_probability(probability: float) -> str:
    if probability <= 0.40:
        return "Low Risk"
    if probability <= 0.70:
        return "Medium Risk"
    return "High Risk"


def _friendly_feature_name(name: str) -> str:
    mapping = {
        "CreditScore": "credit score",
        "Age": "age",
        "Tenure": "account tenure",
        "Balance": "account balance",
        "NumOfProducts": "number of products",
        "HasCrCard": "credit-card ownership",
        "IsActiveMember": "membership activity",
        "EstimatedSalary": "estimated salary",
        "Geography": "geography",
        "Gender": "gender",
    }
    for key, label in mapping.items():
        if key in name:
            return label
    return name.replace("_", " ").lower()


def explain_prediction(
    model: Any, preprocessor: Any, transformed: np.ndarray, probability: float
) -> list[str]:
    feature_names = list(preprocessor.get_feature_names_out())
    contributions: np.ndarray | None = None

    # SHAP is optional because its native dependencies are not available on every host.
    try:
        import shap

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(transformed)
        if isinstance(shap_values, list):
            contributions = np.asarray(shap_values[-1][0])
        else:
            values = np.asarray(shap_values)
            contributions = values[0, :, -1] if values.ndim == 3 else values[0]
    except Exception:
        if hasattr(model, "feature_importances_"):
            direction = np.where(transformed[0] >= 0, 1, -1)
            contributions = np.asarray(model.feature_importances_) * direction
        elif hasattr(model, "coef_"):
            contributions = np.asarray(model.coef_[0]) * transformed[0]

    if contributions is None or len(contributions) != len(feature_names):
        return ["The score reflects the combined effect of activity, products, age, balance, and tenure."]

    ranked = np.argsort(np.abs(contributions))[::-1]
    reasons: list[str] = []
    seen: set[str] = set()
    for index in ranked:
        friendly = _friendly_feature_name(feature_names[index])
        if friendly in seen:
            continue
        seen.add(friendly)
        impact = "increases" if contributions[index] > 0 else "reduces"
        reasons.append(f"The customer's {friendly} {impact} the estimated churn risk.")
        if len(reasons) == 4:
            break
    if probability >= 0.7:
        reasons.insert(0, "The model detected a strong combination of churn-risk signals.")
    return reasons


def predict_customer(customer: dict[str, Any]) -> dict[str, Any]:
    artifacts = load_artifacts()
    frame = pd.DataFrame([customer], columns=FEATURE_COLUMNS)
    transformed = artifacts["preprocessor"].transform(frame)
    probability = float(artifacts["model"].predict_proba(transformed)[0][1])
    prediction = int(probability >= 0.5)

    segment_values = frame[SEGMENT_COLUMNS]
    segment_scaled = artifacts["segment_scaler"].transform(segment_values)
    cluster = int(artifacts["kmeans"].predict(segment_scaled)[0])
    segment = artifacts["metadata"]["cluster_labels"].get(str(cluster), "Loyal Customers")

    return {
        "churn_prediction": prediction,
        "churn_label": "Likely to Churn" if prediction else "Likely to Stay",
        "churn_probability": round(probability, 4),
        "risk_category": risk_from_probability(probability),
        "customer_segment": segment,
        "explainable_reasons": explain_prediction(
            artifacts["model"], artifacts["preprocessor"], transformed, probability
        ),
        "retention_recommendations": generate_recommendations(customer, probability),
    }
