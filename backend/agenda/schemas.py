from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ==========================================
# SCHEMAS PARA LA AGENDA INTELIGENTE
# ==========================================

# 🌟 DTOs PARA EL CRM / BUSCADOR
class ConsumidorBusqueda(BaseModel):
    id: int
    nombre: str
    correo: str
    
    class Config:
        from_attributes = True

class NotaHistorial(BaseModel):
    id_cita: int # 🌟 NUEVO: Requerido para navegar al Workspace
    fecha: str
    servicio: str
    texto: str

class ConsumidorHistorialResponse(BaseModel):
    id: int
    nombre: str
    correo: str
    historial_notas: List[NotaHistorial] = []

class VincularConsumidorRequest(BaseModel):
    id_usuario_consumidor: int

# ==========================================

class CitaBase(BaseModel):
    id_sucursal: int
    titulo: str
    descripcion: Optional[str] = None
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    numero_bloques: int
    notas_internas: Optional[str] = None
    estado: str = "Programada" 

class CitaCreate(CitaBase):
    id_servicio_disponible: Optional[int] = None
    id_usuario_consumidor: Optional[int] = None

class CitaUpdate(BaseModel):
    descripcion: Optional[str] = None
    notas_internas: Optional[str] = None
    estado: Optional[str] = None
    fecha_hora_inicio: Optional[datetime] = None
    fecha_hora_fin: Optional[datetime] = None

class CitaResponse(CitaBase):
    id: int
    tipo: str 
    consumidores_vinculados: List[ConsumidorBusqueda] = []
    
    class Config:
        from_attributes = True

class ServicioDropdownResponse(BaseModel):
    id: int
    nombre: str
    costo: float