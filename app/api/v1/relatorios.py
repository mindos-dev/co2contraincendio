from fastapi import APIRouter, Depends
from app.modules.operis_eng.engine import Engine
from app.core.deps import get_user, CurrentUser

router = APIRouter()


@router.get("/user")
async def get_user_info(user: CurrentUser = Depends(get_user)):
    """
    Retorna dados do usuário autenticado incluindo plano.
    Requer Bearer token JWT válido.
    """
    return {
        "email": user.email,
        "plano": user.plano
    }


@router.post("/gerar-relatorio")
def gerar_relatorio(data: dict, user: CurrentUser = Depends(get_user)):
    engine = Engine()
    resultado = engine.processar(data)

    return {
        "usuario": user.email,
        "plano": user.plano,
        "status": "success",
        "data": resultado,
        "message": "Relatório gerado com sucesso"
    }
