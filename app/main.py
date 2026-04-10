from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import upload, analysis, health, engenharia
from app.api.v1 import relatorios, auth
import os

app = FastAPI(title="OPERIS.ENG COMPLETE")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas existentes
app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(health.router)
app.include_router(engenharia.router)

# API v1 — Protocolo Cirúrgico
app.include_router(relatorios.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")

# Servir frontend estático
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
