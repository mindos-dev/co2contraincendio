
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

class ReportPDF:
    def gerar(self, texto):
        path = "/tmp/laudo.pdf"
        doc = SimpleDocTemplate(path)
        styles = getSampleStyleSheet()
        content = [
            Paragraph("OPERIS RELATORIO", styles["Title"]),
            Paragraph(texto, styles["Normal"])
        ]
        doc.build(content)
        return path
