from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
)

from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np

from .models import DatasetUpload


def draw_footer(canvas, doc):
    canvas.saveState()

    footer_text = (
        f"Chemical Equipment Parameter Visualizer | "
        f"Generated on: {datetime.now().strftime('%d %b %Y')} | "
        f"Page {doc.page}"
    )

    canvas.setFont("Helvetica", 9)
    canvas.setFillColorRGB(0.3, 0.3, 0.3)
    canvas.drawCentredString(A4[0] / 2, 15, footer_text)

    canvas.restoreState()


def generate_dataset_pdf(dataset_id, file_path):
    dataset = DatasetUpload.objects.get(id=dataset_id)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    elements = []

    # ---------- STYLES ----------
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        alignment=1,
        textColor=colors.HexColor("#1F618D")
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#2E4053")
    )

    # ---------- HEADER ----------
    elements.append(Paragraph("Chemical Equipment Parameter Visualizer", title_style))
    elements.append(Spacer(1, 10))
    elements.append(
        Paragraph(
            f"<b>Filename:</b> {dataset.filename}<br/>"
            f"<b>Uploaded At:</b> {dataset.uploaded_at}",
            styles["Normal"]
        )
    )
    elements.append(Spacer(1, 18))

    # ---------- SUMMARY TABLE ----------
    elements.append(Paragraph("Summary Statistics", section_style))
    elements.append(Spacer(1, 8))

    summary_data = [
        ["Metric", "Value"],
        ["Total Equipment", dataset.total_count],
        ["Average Flowrate", round(dataset.avg_flowrate, 2)],
        ["Average Pressure", round(dataset.avg_pressure, 2)],
        ["Average Temperature", round(dataset.avg_temperature, 2)],
    ]

    summary_table = Table(summary_data, colWidths=[220, 160])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F618D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("ALIGN", (1, 1), (-1, -1), "CENTER"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
    ]))

    elements.append(summary_table)
    elements.append(Spacer(1, 20))

    # ---------- PIE CHART ----------
    elements.append(Paragraph("Equipment Type Distribution", section_style))
    elements.append(Spacer(1, 10))

    labels = list(dataset.type_distribution.keys())
    values = list(dataset.type_distribution.values())

    plt.figure(figsize=(4, 4))
    plt.pie(
        values,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140,
        shadow=True,
        explode=[0.05] * len(values)
    )
    plt.axis("equal")

    pie_path = file_path.replace(".pdf", "_pie.png")
    plt.savefig(pie_path)
    plt.close()

    elements.append(Image(pie_path, width=4 * inch, height=4 * inch))
    elements.append(Spacer(1, 20))

   
    # ---------- FORCE NEW PAGE ----------
    elements.append(PageBreak())
    # ---------- 3D BAR CHART ----------
    elements.append(Paragraph("Average Operating Parameters (3D View)", section_style))
    elements.append(Spacer(1, 10))

    metrics = ["Flowrate", "Pressure", "Temperature"]
    averages = [
        dataset.avg_flowrate,
        dataset.avg_pressure,
        dataset.avg_temperature
    ]

    fig = plt.figure(figsize=(6, 4))
    ax = fig.add_subplot(111, projection="3d")

    x_pos = np.arange(len(metrics))
    dx = dy = np.ones(len(metrics)) * 0.5
    dz = averages

    ax.bar3d(x_pos, np.zeros(len(metrics)), np.zeros(len(metrics)), dx, dy, dz, shade=True)

    ax.set_xticks(x_pos)
    ax.set_xticklabels(metrics)
    ax.set_zlabel("Average Value")
    ax.set_title("3D Average Parameter Analysis")

    bar_path = file_path.replace(".pdf", "_3d_bar.png")
    plt.tight_layout()
    plt.savefig(bar_path)
    plt.close()

    elements.append(Image(bar_path, width=5.5 * inch, height=3.5 * inch))

    
    doc.build(
        elements,
        onFirstPage=draw_footer,
        onLaterPages=draw_footer
    )
