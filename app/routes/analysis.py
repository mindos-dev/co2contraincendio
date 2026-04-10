
from fastapi import APIRouter
from app.services.operis_brain import OperisBrain

router = APIRouter()
brain = OperisBrain()

@router.post("/analisar")
def analisar(payload: dict):
    texto = payload.get("texto", "")
    return brain.executar("Analise técnica", texto)
