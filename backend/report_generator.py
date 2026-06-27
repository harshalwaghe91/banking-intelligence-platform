"""Professional PDF report generation."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

BASE_DIR = Path(__file__).resolve().parent
REPORTS_DIR = BASE_DIR / "reports"


def generate_customer_report(customer: dict[str, Any], prediction: dict[str, Any]) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"customer-risk-report-{datetime.now():%Y%m%d}-{uuid4().hex[:8]}.pdf"
    path = REPORTS_DIR / filename

    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        textColor=colors.HexColor("#0F2A5F"),
        alignment=TA_CENTER,
        fontSize=20,
        leading=25,
        spaceAfter=8,
    )
    heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#1463FF"),
        fontSize=12,
        spaceBefore=10,
        spaceAfter=7,
    )
    body = ParagraphStyle("Body", parent=styles["BodyText"], leading=15, textColor=colors.HexColor("#26344D"))

    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Customer Churn Intelligence Report",
    )
    story = [
        Paragraph("AI-Powered Banking Intelligence Platform", title),
        Paragraph("Customer Churn & Retention Report", styles["Heading2"]),
        Paragraph(
            f"Generated {datetime.now(timezone.utc).strftime('%B %d, %Y at %H:%M UTC')}",
            styles["BodyText"],
        ),
        Spacer(1, 10),
    ]

    customer_rows = [["Customer Attribute", "Value"]] + [
        [key, f"${value:,.2f}" if key in {"Balance", "EstimatedSalary"} else str(value)]
        for key, value in customer.items()
    ]
    table = Table(customer_rows, colWidths=[75 * mm, 90 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F2A5F")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#DCE5F2")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F8FC")]),
                ("PADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.extend([Paragraph("Customer Profile", heading), table])

    summary_rows = [
        ["Prediction", prediction["churn_label"]],
        ["Churn Probability", f"{prediction['churn_probability'] * 100:.1f}%"],
        ["Risk Category", prediction["risk_category"]],
        ["Customer Segment", prediction["customer_segment"]],
    ]
    summary = Table(summary_rows, colWidths=[75 * mm, 90 * mm])
    summary.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E9F1FF")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#C9D8EE")),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.extend([Paragraph("Intelligence Summary", heading), summary])

    story.append(Paragraph("Explainable AI Insights", heading))
    for reason in prediction["explainable_reasons"]:
        story.append(Paragraph(f"• {reason}", body))
        story.append(Spacer(1, 3))

    story.append(Paragraph("Recommended Retention Actions", heading))
    for recommendation in prediction["retention_recommendations"]:
        story.append(Paragraph(f"• {recommendation}", body))
        story.append(Spacer(1, 3))

    story.extend(
        [
            Spacer(1, 12),
            Paragraph(
                "Decision-support notice: this report supports human review and should not be used as the sole basis for customer treatment.",
                ParagraphStyle("Notice", parent=body, fontSize=8, textColor=colors.HexColor("#65738B")),
            ),
        ]
    )
    doc.build(story)
    return filename
