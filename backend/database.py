"""SQLite helpers for customer prediction records."""

from __future__ import annotations

import json
import os
import sqlite3
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("DATABASE_PATH", str(BASE_DIR / "banking_intelligence.db")))


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS customer_profiles (
                customer_id TEXT PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                masked_account TEXT NOT NULL,
                branch TEXT NOT NULL,
                relationship_manager TEXT NOT NULL,
                credit_score INTEGER NOT NULL,
                geography TEXT NOT NULL,
                gender TEXT NOT NULL,
                age INTEGER NOT NULL,
                tenure INTEGER NOT NULL,
                balance REAL NOT NULL,
                num_of_products INTEGER NOT NULL,
                has_cr_card INTEGER NOT NULL,
                is_active_member INTEGER NOT NULL,
                estimated_salary REAL NOT NULL,
                account_status TEXT NOT NULL DEFAULT 'Active',
                last_contact_at TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                credit_score INTEGER NOT NULL,
                geography TEXT NOT NULL,
                gender TEXT NOT NULL,
                age INTEGER NOT NULL,
                tenure INTEGER NOT NULL,
                balance REAL NOT NULL,
                num_of_products INTEGER NOT NULL,
                has_cr_card INTEGER NOT NULL,
                is_active_member INTEGER NOT NULL,
                estimated_salary REAL NOT NULL,
                external_customer_id TEXT,
                churn_prediction INTEGER NOT NULL,
                churn_probability REAL NOT NULL,
                risk_category TEXT NOT NULL,
                customer_segment TEXT NOT NULL,
                reasons TEXT NOT NULL,
                recommendations TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(customers)").fetchall()
        }
        if "external_customer_id" not in columns:
            connection.execute("ALTER TABLE customers ADD COLUMN external_customer_id TEXT")
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_profiles_name ON customer_profiles(full_name)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_profiles_geography ON customer_profiles(geography)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_assessments_external_id ON customers(external_customer_id)"
        )
        # Keep masked sample data readable if an older build used incompatible glyphs.
        connection.execute(
            """
            UPDATE customer_profiles
            SET phone = '+XX **** ' || substr(phone, -4)
            WHERE phone NOT LIKE '+XX **** %'
            """
        )
        connection.execute(
            """
            UPDATE customer_profiles
            SET masked_account = '**** ' || substr(masked_account, -4)
            WHERE masked_account NOT LIKE '**** %'
            """
        )
        connection.commit()


def seed_customer_profiles(records: list[dict[str, Any]]) -> int:
    """Seed an operational customer directory once from the available dataset."""
    first_names = [
        "Aarav", "Sofia", "Noah", "Emma", "Liam", "Mia", "Lucas", "Olivia",
        "Ethan", "Amelia", "Hugo", "Isla", "Leo", "Ava", "Felix", "Clara",
    ]
    last_names = [
        "Martin", "Schmidt", "Garcia", "Bernard", "Meyer", "Lopez", "Dubois",
        "Weber", "Rossi", "Fischer", "Moreau", "Navarro", "Klein", "Laurent",
    ]
    branches = {
        "France": ["Paris Central", "Lyon Business", "Marseille Harbour"],
        "Germany": ["Berlin Mitte", "Frankfurt Finance", "Munich Central"],
        "Spain": ["Madrid Centro", "Barcelona Diagonal", "Valencia Central"],
    }
    managers = ["Maya Chen", "Daniel Brooks", "Priya Shah", "Elena Torres", "Jonas Weber"]

    with get_connection() as connection:
        existing = connection.execute("SELECT COUNT(*) AS count FROM customer_profiles").fetchone()
        if existing["count"]:
            return int(existing["count"])
        rows = []
        for index, record in enumerate(records, start=1):
            customer_id = f"CUST-{index:06d}"
            first = first_names[(index * 7) % len(first_names)]
            last = last_names[(index * 11) % len(last_names)]
            geography = str(record["Geography"])
            rows.append(
                (
                    customer_id,
                    f"{first} {last}",
                    f"{first.lower()}.{last.lower()}{index % 97}@customer.example",
                    f"+XX **** {1000 + (index * 37) % 9000}",
                    f"**** {1000 + (index * 83) % 9000}",
                    branches[geography][index % len(branches[geography])],
                    managers[index % len(managers)],
                    int(record["CreditScore"]),
                    geography,
                    str(record["Gender"]),
                    int(record["Age"]),
                    int(record["Tenure"]),
                    float(record["Balance"]),
                    int(record["NumOfProducts"]),
                    int(record["HasCrCard"]),
                    int(record["IsActiveMember"]),
                    float(record["EstimatedSalary"]),
                    "Active",
                )
            )
        connection.executemany(
            """
            INSERT INTO customer_profiles (
                customer_id, full_name, email, phone, masked_account, branch,
                relationship_manager, credit_score, geography, gender, age,
                tenure, balance, num_of_products, has_cr_card, is_active_member,
                estimated_salary, account_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        connection.commit()
        return len(rows)


def _profile_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    item = dict(row)
    item["model_features"] = {
        "CreditScore": item.pop("credit_score"),
        "Geography": item["geography"],
        "Gender": item.pop("gender"),
        "Age": item.pop("age"),
        "Tenure": item["tenure"],
        "Balance": item["balance"],
        "NumOfProducts": item.pop("num_of_products"),
        "HasCrCard": item.pop("has_cr_card"),
        "IsActiveMember": item.pop("is_active_member"),
        "EstimatedSalary": item.pop("estimated_salary"),
    }
    return item


def search_customer_profiles(
    search: str | None = None,
    geography: str | None = None,
    limit: int = 25,
) -> list[dict[str, Any]]:
    clauses: list[str] = []
    values: list[Any] = []
    if search:
        clauses.append(
            "(customer_id LIKE ? OR full_name LIKE ? OR masked_account LIKE ? OR branch LIKE ?)"
        )
        term = f"%{search.strip()}%"
        values.extend([term, term, term, term])
    if geography:
        clauses.append("geography = ?")
        values.append(geography)
    query = "SELECT * FROM customer_profiles"
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY full_name LIMIT ?"
    values.append(max(1, min(limit, 100)))
    with get_connection() as connection:
        rows = connection.execute(query, values).fetchall()
    return [_profile_to_dict(row) for row in rows]


def get_customer_profile(customer_id: str) -> dict[str, Any] | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM customer_profiles WHERE customer_id = ?", (customer_id,)
        ).fetchone()
    return _profile_to_dict(row) if row else None


def save_prediction(
    customer: dict[str, Any],
    result: dict[str, Any],
    external_customer_id: str | None = None,
) -> int:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO customers (
                credit_score, geography, gender, age, tenure, balance,
                num_of_products, has_cr_card, is_active_member,
                estimated_salary, external_customer_id, churn_prediction, churn_probability,
                risk_category, customer_segment, reasons, recommendations
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                customer["CreditScore"],
                customer["Geography"],
                customer["Gender"],
                customer["Age"],
                customer["Tenure"],
                customer["Balance"],
                customer["NumOfProducts"],
                customer["HasCrCard"],
                customer["IsActiveMember"],
                customer["EstimatedSalary"],
                external_customer_id,
                result["churn_prediction"],
                result["churn_probability"],
                result["risk_category"],
                result["customer_segment"],
                json.dumps(result["explainable_reasons"]),
                json.dumps(result["retention_recommendations"]),
            ),
        )
        connection.commit()
        return int(cursor.lastrowid)


def fetch_customers(
    risk_level: str | None = None,
    geography: str | None = None,
    gender: str | None = None,
    churn_status: int | None = None,
    search: str | None = None,
    limit: int = 250,
) -> list[dict[str, Any]]:
    clauses: list[str] = []
    values: list[Any] = []

    if risk_level:
        clauses.append("customers.risk_category = ?")
        values.append(risk_level)
    if geography:
        clauses.append("customers.geography = ?")
        values.append(geography)
    if gender:
        clauses.append("customers.gender = ?")
        values.append(gender)
    if churn_status is not None:
        clauses.append("customers.churn_prediction = ?")
        values.append(churn_status)
    if search:
        clauses.append(
            "(CAST(customers.id AS TEXT) LIKE ? OR customers.external_customer_id LIKE ? "
            "OR customer_profiles.full_name LIKE ? OR customers.geography LIKE ? "
            "OR customers.gender LIKE ? OR customers.customer_segment LIKE ?)"
        )
        term = f"%{search}%"
        values.extend([term, term, term, term, term, term])

    query = """
        SELECT customers.*, customer_profiles.full_name,
               customer_profiles.masked_account, customer_profiles.branch,
               customer_profiles.relationship_manager
        FROM customers
        LEFT JOIN customer_profiles
          ON customer_profiles.customer_id = customers.external_customer_id
    """
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY customers.created_at DESC LIMIT ?"
    values.append(max(1, min(limit, 1000)))

    with get_connection() as connection:
        rows = connection.execute(query, values).fetchall()

    results = []
    for row in rows:
        item = dict(row)
        item["reasons"] = json.loads(item["reasons"])
        item["recommendations"] = json.loads(item["recommendations"])
        results.append(item)
    return results


def list_reports() -> list[dict[str, Any]]:
    reports_dir = BASE_DIR / "reports"
    reports_dir.mkdir(exist_ok=True)
    return [
        {
            "filename": path.name,
            "size_bytes": path.stat().st_size,
            "created_at": path.stat().st_mtime,
        }
        for path in sorted(reports_dir.glob("*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
    ]
