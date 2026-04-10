from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet


class ReportPDF:

    def gerar(self, dados) -> str:
        path = "/tmp/laudo_operis.pdf"
        doc = SimpleDocTemplate(path)
        styles = getSampleStyleSheet()
        texto = dados if isinstance(dados, str) else str(dados.get("resumo", ""))
        content = [
            Paragraph("OPERIS — RELATÓRIO TÉCNICO", styles["Title"]),
            Paragraph(texto, styles["Normal"])
        ]
        doc.build(content)
        return path
