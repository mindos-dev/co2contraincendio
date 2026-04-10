from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from app.core.security import validar_token

security = HTTPBearer()


class CurrentUser(BaseModel):
    email: str
    plano: str


def get_user(token=Depends(security)):
    payload = validar_token(token.credentials)

    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido")

    return CurrentUser(
        email=payload.get("sub"),
        plano=payload.get("plano")
    )
