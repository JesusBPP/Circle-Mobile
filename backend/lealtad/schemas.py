from pydantic import BaseModel, root_validator
from typing import Optional, List
from datetime import datetime

# ==========================================
# SCHEMAS PARA CREACIÓN
# ==========================================

class OfertaCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime
    costo_en_puntos: Optional[float] = None
    limite_existencias: Optional[int] = None
    limite_por_usuario: Optional[int] = None
    es_publica: bool = True
    whitelist_ids: List[int] = []

    @root_validator(pre=True)
    def validar_reglas_oferta(cls, values):
        inicio = values.get('fecha_inicio')
        fin = values.get('fecha_fin')
        es_publica = values.get('es_publica')
        whitelist = values.get('whitelist_ids')

        if inicio and fin and fin <= inicio:
            raise ValueError('La fecha de finalización debe ser posterior a la fecha de inicio.')
        if not es_publica and (not whitelist or len(whitelist) == 0):
            raise ValueError('Una oferta privada (VIP) debe tener al menos un cliente en la whitelist.')
        return values

class PublicacionCreate(BaseModel):
    titulo: str
    descripcion: str
    url_imagen: Optional[str] = None
    id_oferta: Optional[int] = None
    habilitar_comentarios: bool = True

# 🌟 NUEVO: SCHEMAS PARA ACTUALIZACIÓN (PUT)
class OfertaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None

class PublicacionUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    habilitar_comentarios: Optional[bool] = None

# ==========================================
# SCHEMAS PARA LECTURA (DASHBOARD)
# ==========================================

class MetricasSucursal(BaseModel):
    id: int
    nombre: str = ""
    calificacion: float
    total_resenas: int

class DashboardLealtadResponse(BaseModel):
    calificacion_global: float
    total_resenas_globales: int
    sucursales: List[MetricasSucursal]
    feed_items: List[dict]

class QRTokenResponse(BaseModel):
    token_qr: str
    expira_en_segundos: int

class CanjearQRRequest(BaseModel):
    token_qr: str
    id_transaccion: int

class CanjeResponse(BaseModel):
    mensaje: str
    id_uso: int
    titulo_oferta: str
    descuento_aplicado: str