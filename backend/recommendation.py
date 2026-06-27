"""Rule-based, transparent retention recommendation engine."""

from typing import Any


def generate_recommendations(customer: dict[str, Any], probability: float) -> list[str]:
    recommendations: list[str] = []

    if customer["IsActiveMember"] == 0:
        recommendations.append("Schedule a relationship-manager call and a personalized account review.")
    if customer["Balance"] >= 100_000 and probability >= 0.4:
        recommendations.append("Offer premium banking benefits, fee waivers, or priority support.")
    if customer["Tenure"] <= 2:
        recommendations.append("Provide a welcome loyalty reward to strengthen the early relationship.")
    if customer["Age"] >= 55:
        recommendations.append("Offer personalized assistance and simplified digital-banking guidance.")
    if customer["NumOfProducts"] <= 1:
        recommendations.append("Recommend a relevant bundled product based on the customer's needs.")
    if customer["HasCrCard"] == 0:
        recommendations.append("Present a pre-qualified credit-card offer with clear, relevant benefits.")
    if customer["CreditScore"] < 580:
        recommendations.append("Offer a financial wellness session and credit-building resources.")
    if probability >= 0.7:
        recommendations.append("Prioritize this customer for immediate retention outreach within 24 hours.")

    if not recommendations:
        recommendations.append("Maintain engagement with loyalty updates and periodic financial check-ins.")
    return recommendations
