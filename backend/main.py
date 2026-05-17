from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# =============================================================================
# 1. REGISTRO DE MODELOS (Inicialización Temprana)
# REGLA DE ORO: Importar los modelos antes que los enrutadores para que 
# SQLAlchemy construya el grafo de relaciones sin errores de 'KeyError'.
# =============================================================================
from backend.usuarios import models as _
from backend.negocios import models as _
from backend.agenda import models as _
from backend.catalogo import models as _
from backend.finanzas import models as _
from backend.lealtad import models as _

# =============================================================================
# 2. IMPORTACIÓN DE DOMINIOS (Routers)
# =============================================================================
from backend.negocios import router as negocios_router
from backend.usuarios import router as usuarios_router
from backend.auth import router as auth_router
from backend.agenda import router as agenda_router
from backend.lealtad import router as lealtad_router

# =============================================================================
# 3. PATRÓN DE DISEÑO: APPLICATION FACTORY / MODULAR CONFIGURATOR
# =============================================================================

def configurar_cors(aplicacion: FastAPI):
    """Configura las políticas de seguridad y origen (CORS)."""
    aplicacion.add_middleware(
        CORSMiddleware,
        allow_origins=["*"], 
        allow_credentials=True,
        allow_methods=["*"], 
        allow_headers=["*"], 
    )

def configurar_rutas(aplicacion: FastAPI):
    """Registra todos los dominios operativos en la aplicación central."""
    aplicacion.include_router(negocios_router.router)
    aplicacion.include_router(usuarios_router.router)
    aplicacion.include_router(auth_router.router)
    aplicacion.include_router(agenda_router.router)
    aplicacion.include_router(lealtad_router.router)

def crear_aplicacion() -> FastAPI:
    """Fábrica principal que ensambla y devuelve la aplicación FastAPI lista."""
    app_central = FastAPI(
        title="Circle API", 
        description="Backend Enterprise para el ecosistema Circle",
        version="2.0.0"
    )
    
    # Ensamblamos los módulos
    configurar_cors(app_central)
    configurar_rutas(app_central)
    
    # Ruta de salud del servidor (Health Check)
    @app_central.get("/", tags=["Sistema"])
    def ruta_raiz():
        return {"mensaje": "¡El servidor Enterprise de Circle está corriendo perfectamente!"}
        
    return app_central

# =============================================================================
# 4. INSTANCIA DE EJECUCIÓN (Punto de Entrada)
# =============================================================================
app = crear_aplicacion()