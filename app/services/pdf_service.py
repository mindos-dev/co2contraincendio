
import fitz
class PDFService:
    def extrair_texto(self, path):
        doc = fitz.open(path)
        texto = ""
        for p in doc:
            texto += p.get_text()
        return texto
