import ezdxf


class DWGService:

    def extrair_dwg(self, path: str) -> str:
        try:
            doc = ezdxf.readfile(path)
        except Exception:
            return "Erro leitura DWG"
        texto = ""
        for e in doc.modelspace():
            texto += e.dxftype() + " "
        return texto

    def gerar(self, dados: dict) -> str:
        return dados.get("arquivo_dwg", "sem_dwg.dxf")
