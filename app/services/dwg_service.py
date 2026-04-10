
import ezdxf
class DWGService:
    def extrair_dwg(self, path):
        try:
            doc = ezdxf.readfile(path)
        except:
            return "Erro leitura DWG"
        texto = ""
        for e in doc.modelspace():
            texto += e.dxftype() + " "
        return texto
