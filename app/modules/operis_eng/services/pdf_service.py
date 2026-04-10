import fitz


class PDFService:

    def extrair_texto(self, path: str) -> str:
        doc = fitz.open(path)
        texto = ""
        for p in doc:
            texto += p.get_text()
        return texto

    def processar(self, data: dict) -> dict:
        path = data.get("arquivo_pdf", "")
        texto = self.extrair_texto(path) if path else data.get("texto", "")
        paginas = 0
        if path:
            try:
                paginas = len(fitz.open(path))
            except Exception:
                paginas = 0
        return {"texto": texto, "paginas": paginas}
