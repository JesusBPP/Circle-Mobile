from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ==========================================
# SCHEMAS PARA LA AGENDA INTELIGENTE
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
    # 🌟 NUEVO: Opcional. Si viene, es una Cita con cliente. Si no, es Evento interno.
    id_servicio_producto: Optional[int] = None

class CitaUpdate(BaseModel):
    descripcion: Optional[str] = None
    notas_internas: Optional[str] = None
    # 🌟 NUEVO: Máquina de estados y Reprogramación
    estado: Optional[str] = None
    fecha_hora_inicio: Optional[datetime] = None
    fecha_hora_fin: Optional[datetime] = None

class CitaResponse(CitaBase):
    id: int
    tipo: str # 'cita' o 'evento'
    
    class Config:
        from_attributes = True

class ServicioDropdownResponse(BaseModel):
    id: int
    nombre: str
    costo: float