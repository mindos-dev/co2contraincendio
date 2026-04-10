class RassService:

    def fragmentar(self, texto: str) -> list:
        return texto.split(".")[:100]

    def calcular(self, dados: dict) -> dict:
        texto = dados.get("texto", "")
        fragmentos = self.fragmentar(texto)
        return {
            "fragmentos": len(fragmentos),
            "risco": "BAIXO" if len(fragmentos) < 10 else "MEDIO",
            "resumo": fragmentos[0] if fragmentos else ""
        }
