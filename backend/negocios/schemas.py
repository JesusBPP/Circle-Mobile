from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ==========================================
# SCHEMAS PARA SOLUCIONES (App Store)
# ==========================================

# 1. Molde para lo que envía el Frontend al presionar "Instalar"
class InstalarSolucionRequest(BaseModel):
    id_negocio: int
    id_solucion: int

# 2. Molde para leer la información de la herramienta
class SolucionResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    ruta_frontend: Optional[str] = None
    es_premium_exclusiva: bool
    
    class Config:
        from_attributes = True # Permite leer objetos de SQLAlchemy

# 3. Molde para devolver las herramientas instaladas al Menú Radial
class NegocioSolucionResponse(BaseModel):
    id_solucion: int
    fecha_instalacion: datetime
    esta_activa: bool
    
    # 🌟 Magia de Pydantic: Anidamos el modelo para que devuelva los detalles de la herramienta
    solucion: SolucionResponse

    class Config:
        from_attributes = True

# 🌟 SCHEMAS PARA EL DASHBOARD
class DashboardResponse(BaseModel):
    nombre_usuario: str
    nombre_negocio: str
    nombre_sucursal: str
    id_negocio: Optional[int] = None # 🌟 EL DATO CLAVE QUE FALTABA

    class Config:
        from_attributes = True