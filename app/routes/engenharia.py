from fastapi import APIRouter
from app.modules.operis_eng.engine import Engine

router = APIRouter()
engine = Engine()


@router.post("/engenharia/analisar")
def analisar(payload: dict):
    texto = payload.get("texto", "")
    resultado = engine.processar({"texto": texto})
    return resultado
