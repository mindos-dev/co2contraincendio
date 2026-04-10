# app/modules/operis_eng/engine.py

from app.modules.operis_eng.services.pdf_service import PDFService
from app.modules.operis_eng.services.dwg_service import DWGService
from app.modules.operis_eng.services.rass import RassService
from app.modules.operis_eng.services.report_pdf import ReportPDF


class Engine:

    def __init__(self):
        self.pdf = PDFService()
        self.dwg = DWGService()
        self.rass = RassService()
        self.report = ReportPDF()

    def processar(self, data: dict) -> dict:
        dados_pdf = self.pdf.processar(data)
        dados_rass = self.rass.calcular(dados_pdf)
        arquivo_dwg = self.dwg.gerar(dados_rass)
        relatorio = self.report.gerar(dados_rass)

        return {
            "pdf": dados_pdf,
            "rass": dados_rass,
            "dwg": arquivo_dwg,
            "relatorio": relatorio
        }
