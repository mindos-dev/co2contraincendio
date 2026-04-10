from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from app.core.security import validar_token

security = HTTPBearer()

def get_user(token=Depends(security)):
    payload = validar_token(token.credentials)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    return payload
