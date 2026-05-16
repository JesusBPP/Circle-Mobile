from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importación de Routers
from backend.negocios import router as negocios_router
from backend.usuarios import router as usuarios_router
from backend.auth import router as auth_router
from backend.agenda import router as agenda_router

app = FastAPI(title="Circle API", description="Backend para el ecosistema Circle")

# ==========================================
# ESCUDO CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# INCLUSIÓN DE RUTAS
# ==========================================
app.include_router(negocios_router.router)
app.include_router(usuarios_router.router)
app.include_router(auth_router.router)
app.include_router(agenda_router.router)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡El servidor de Circle está corriendo perfectamente!"}