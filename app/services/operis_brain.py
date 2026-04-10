
from app.services.report_pdf import ReportPDF
from app.services.rass import RASS

class OperisBrain:
    def __init__(self):
        self.report = ReportPDF()
        self.rass = RASS()

    def executar(self, pergunta, texto):
        partes = self.rass.fragmentar(texto)
        analise = f"Analise com {len(partes)} fragmentos"
        pdf = self.report.gerar(analise)
        return {"analise": analise, "pdf": pdf}
