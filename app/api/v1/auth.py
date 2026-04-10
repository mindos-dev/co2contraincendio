from fastapi import APIRouter, HTTPException
from app.db.fake_users import fake_users_db
from app.core.security import verificar_senha, criar_token

router = APIRouter()

@router.post("/login")
def login(email: str, senha: str):
    user = fake_users_db.get(email)

    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    if not verificar_senha(senha, user["senha"]):
        raise HTTPException(status_code=401, detail="Senha inválida")

    token = criar_token({
        "sub": user["email"],
        "plano": user["plano"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "plano": user["plano"]
    }
