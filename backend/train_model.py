"""Train churn and segmentation models.

Run:
    python train_model.py
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
DATA_PATH = DATA_DIR / "customer_churn.csv"

FEATURE_COLUMNS = [
    "CreditScore",
    "Geography",
    "Gender",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "HasCrCard",
    "IsActiveMember",
    "EstimatedSalary",
]
NUMERIC_COLUMNS = [
    "CreditScore",
    "Age",
    "Tenure",
    "Balance",
    "NumOfProducts",
    "HasCrCard",
    "IsActiveMember",
    "EstimatedSalary",
]
CATEGORICAL_COLUMNS = ["Geography", "Gender"]
SEGMENT_COLUMNS = ["Age", "Tenure", "Balance", "NumOfProducts", "IsActiveMember", "EstimatedSalary"]


def sigmoid(values: np.ndarray) -> np.ndarray:
    return 1 / (1 + np.exp(-values))


def generate_synthetic_dataset(rows: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    geography = rng.choice(["France", "Germany", "Spain"], rows, p=[0.5, 0.25, 0.25])
    gender = rng.choice(["Male", "Female"], rows)
    age = np.clip(rng.normal(40, 11, rows).round(), 18, 92).astype(int)
    tenure = rng.integers(0, 11, rows)
    balance = np.where(rng.random(rows) < 0.22, 0, np.clip(rng.normal(105_000, 52_000, rows), 0, 260_000))
    products = rng.choice([1, 2, 3, 4], rows, p=[0.48, 0.43, 0.075, 0.015])
    active = rng.binomial(1, 0.51, rows)
    credit_card = rng.binomial(1, 0.71, rows)
    credit_score = np.clip(rng.normal(650, 95, rows).round(), 350, 850).astype(int)
    salary = rng.uniform(10_000, 200_000, rows)

    logits = (
        -2.15
        + 0.055 * (age - 40)
        + 0.65 * (geography == "Germany")
        + 0.25 * (gender == "Female")
        + 0.95 * (1 - active)
        + 0.55 * (products == 1)
        + 1.15 * (products >= 3)
        + 0.35 * (tenure <= 2)
        + 0.4 * (balance > 150_000)
        - 0.0025 * (credit_score - 650)
    )
    probability = sigmoid(logits)
    exited = rng.binomial(1, np.clip(probability, 0.03, 0.92))

    return pd.DataFrame(
        {
            "CreditScore": credit_score,
            "Geography": geography,
            "Gender": gender,
            "Age": age,
            "Tenure": tenure,
            "Balance": balance.round(2),
            "NumOfProducts": products,
            "HasCrCard": credit_card,
            "IsActiveMember": active,
            "EstimatedSalary": salary.round(2),
            "Exited": exited,
        }
    )


def load_or_create_data() -> pd.DataFrame:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        print("Dataset not found. Generating 5,000 synthetic customer records...")
        generate_synthetic_dataset().to_csv(DATA_PATH, index=False)
    data = pd.read_csv(DATA_PATH)
    missing = set(FEATURE_COLUMNS + ["Exited"]) - set(data.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing)}")
    data = data.dropna(subset=FEATURE_COLUMNS + ["Exited"]).copy()
    data["Geography"] = data["Geography"].str.title()
    data["Gender"] = data["Gender"].str.title()
    return data


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        [
            ("numeric", StandardScaler(), NUMERIC_COLUMNS),
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )


def train() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    data = load_or_create_data()
    X = data[FEATURE_COLUMNS]
    y = data["Exited"].astype(int)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocessor = build_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    candidates = {
        "Logistic Regression": LogisticRegression(max_iter=1500, class_weight="balanced", random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=260, max_depth=12, min_samples_leaf=3, class_weight="balanced", random_state=42
        ),
    }
    try:
        from xgboost import XGBClassifier

        candidates["XGBoost"] = XGBClassifier(
            n_estimators=250,
            max_depth=5,
            learning_rate=0.06,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        )
    except ImportError:
        print("XGBoost is not installed; continuing with scikit-learn models.")

    scores: dict[str, dict[str, float]] = {}
    trained_models = {}
    print("\nModel comparison")
    print("-" * 72)
    for name, model in candidates.items():
        model.fit(X_train_processed, y_train)
        predictions = model.predict(X_test_processed)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_test, predictions, average="binary", zero_division=0
        )
        metrics = {
            "accuracy": accuracy_score(y_test, predictions),
            "precision": precision,
            "recall": recall,
            "f1": f1,
        }
        scores[name] = metrics
        trained_models[name] = model
        print(
            f"{name:22} Accuracy={metrics['accuracy']:.3f} "
            f"Precision={precision:.3f} Recall={recall:.3f} F1={f1:.3f}"
        )

    # F1 balances churn precision and recall better than accuracy on imbalanced data.
    best_name = max(scores, key=lambda name: scores[name]["f1"])
    best_model = trained_models[best_name]
    print(f"\nSelected model: {best_name}\n")
    print(classification_report(y_test, best_model.predict(X_test_processed), zero_division=0))

    segment_scaler = StandardScaler()
    segment_data = segment_scaler.fit_transform(data[SEGMENT_COLUMNS])
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=20)
    cluster_ids = kmeans.fit_predict(segment_data)

    profiles = data.assign(cluster=cluster_ids).groupby("cluster").agg(
        Age=("Age", "mean"),
        Tenure=("Tenure", "mean"),
        Balance=("Balance", "mean"),
        NumOfProducts=("NumOfProducts", "mean"),
        IsActiveMember=("IsActiveMember", "mean"),
        Exited=("Exited", "mean"),
    )
    remaining = set(profiles.index)
    premium = int(profiles["Balance"].idxmax())
    remaining.remove(premium)
    at_risk = int(profiles.loc[list(remaining), "Exited"].idxmax())
    remaining.remove(at_risk)
    new_customer = int(profiles.loc[list(remaining), "Tenure"].idxmin())
    remaining.remove(new_customer)
    loyal = int(remaining.pop())
    cluster_labels = {
        str(loyal): "Loyal Customers",
        str(at_risk): "At-Risk Customers",
        str(premium): "Premium Customers",
        str(new_customer): "New Customers",
    }

    joblib.dump(best_model, MODEL_DIR / "churn_model.pkl")
    joblib.dump(preprocessor, MODEL_DIR / "encoder.pkl")
    # Kept as a separate artifact to match the requested deployment structure.
    joblib.dump(preprocessor.named_transformers_["numeric"], MODEL_DIR / "scaler.pkl")
    joblib.dump(kmeans, MODEL_DIR / "kmeans_model.pkl")
    joblib.dump(segment_scaler, MODEL_DIR / "segment_scaler.pkl")
    (MODEL_DIR / "metadata.json").write_text(
        json.dumps(
            {
                "selected_model": best_name,
                "scores": scores,
                "feature_columns": FEATURE_COLUMNS,
                "segment_columns": SEGMENT_COLUMNS,
                "cluster_labels": cluster_labels,
                "dataset_rows": len(data),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    print(f"Saved model artifacts to {MODEL_DIR}")


if __name__ == "__main__":
    train()
