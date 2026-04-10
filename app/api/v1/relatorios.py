from fastapi import APIRouter, Depends
from app.modules.operis_eng.engine import Engine
from app.core.deps import get_user

router = APIRouter()


@router.get("/user")
async def get_user_info(user=Depends(get_user)):
    """
    Retorna dados do usuário autenticado incluindo plano.
    Requer Bearer token JWT válido.
    """
    return {
        "sub": user.get("sub"),
        "plano": user.get("plano"),
        "nome": "Usuário OPERIS",
        "email": user.get("sub")
    }


@router.post("/gerar-relatorio")
def gerar_relatorio(data: dict, user=Depends(get_user)):
    engine = Engine()
    resultado = engine.processar(data)

    return {
        "user": user,
        "status": "success",
        "data": resultado,
        "message": "Relatório gerado com sucesso"
    }
