
from fastapi import APIRouter, UploadFile, File
import shutil
from app.services.pdf_service import PDFService
from app.services.dwg_service import DWGService

router = APIRouter()
pdf = PDFService()
dwg = DWGService()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    path = f"/tmp/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.endswith(".pdf"):
        texto = pdf.extrair_texto(path)
    else:
        texto = dwg.extrair_dwg(path)

    return {"preview": texto[:500]}
