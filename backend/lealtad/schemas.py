"""
===============================================================================
MÓDULO: LEALTAD — SCHEMAS (DTOs / CONTRATOS DE DATOS)
===============================================================================
Propósito:
    Define los contratos de entrada y salida del dominio de Lealtad usando
    Pydantic v2. Cada schema es un DTO (Data Transfer Object) que valida
    y serializa datos entre el cliente HTTP y las tablas de la BD.

Qué DEBE ir aquí:
    - Schemas de creación (*Create): validan el payload del POST
    - Schemas de actualización (*Update): validan el payload del PUT
    - Schemas de respuesta (*Response): serializan modelos → JSON
    - Validadores de negocio (model_validator)

Qué NO debe ir aquí:
    - Lógica de BD (va en models.py)
    - Lógica de negocio (va en service.py)
    - Endpoints HTTP (van en router.py)

Dependencias de otros archivos del dominio:
    - router.py usa schemas para tipar request/response
    - service.py usa schemas para construir respuestas
    - models.py NO depende de schemas (la dependencia es inversa)

Convenciones:
    - Herencia Base → Create / Update / Response
    - ConfigDict(from_attributes=True) para compatibilidad ORM
    - model_validator en lugar de root_validator (Pydantic v2)
===============================================================================
"""

from pydantic import BaseModel, model_validator, ConfigDict
from typing import Optional, List
from datetime import datetime


# ==========================================
# SCHEMAS PARA CATÁLOGO DISPONIBLE (Lealtad)
# ==========================================

class ServicioDisponibleLealtadResponse(BaseModel):
    """Producto o servicio disponible para usar en reglas de ofertas."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    costo: float
    tipo_producto: str


# ==========================================
# SCHEMAS PARA REGLAS DE OFERTA (Motor NxN)
# ==========================================

class OfertaReglaServicioCreate(BaseModel):
    """Un producto/servicio dentro de una regla de oferta."""
    id_servicio_disponible: int
    cantidad: int = 1
    porcentaje_descuento: Optional[float] = None
    monto_descuento: Optional[float] = None
    monto_minimo: Optional[float] = None

    @model_validator(mode='after')
    def validar_descuento_exclusivo(self):
        if self.porcentaje_descuento is not None and self.monto_descuento is not None:
            raise ValueError('Solo se puede especificar porcentaje de descuento O monto de descuento, no ambos.')
        return self


class OfertaReglaCreate(BaseModel):
    """Bloque de Lego: un requisito o recompensa para armar una oferta."""
    tipo_regla: str  # 'requisito' o 'recompensa'
    servicios: List[OfertaReglaServicioCreate]


class OfertaReglaServicioResponse(BaseModel):
    """Servicio de regla serializado para respuesta API."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_servicio_disponible: int
    nombre_servicio: Optional[str] = None
    tipo_servicio: Optional[str] = None
    cantidad: int
    porcentaje_descuento: Optional[float] = None
    monto_descuento: Optional[float] = None
    monto_minimo: Optional[float] = None


class OfertaReglaResponse(BaseModel):
    """Regla de oferta serializada para respuesta API."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo_regla: str
    servicios: List[OfertaReglaServicioResponse]


# ==========================================
# SCHEMAS PARA CREACIÓN
# ==========================================

class OfertaCreate(BaseModel):
    """Payload para crear una oferta con sus reglas NxN y whitelist opcional."""
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    costo_en_puntos: Optional[float] = None
    limite_existencias: Optional[int] = None
    limite_por_usuario: Optional[int] = None
    es_publica: bool = True
    premio_en_puntos: Optional[float] = None
    premio_en_sellos: Optional[int] = None
    whitelist_ids: List[int] = []
    reglas: List[OfertaReglaCreate] = []
    id_sucursales: Optional[List[int]] = None

    @model_validator(mode='before')
    @classmethod
    def validar_reglas_oferta(cls, values):
        inicio = values.get('fecha_inicio')
        fin = values.get('fecha_fin')
        limite_existencias = values.get('limite_existencias')
        es_publica = values.get('es_publica', True)
        whitelist = values.get('whitelist_ids')

        if limite_existencias is None and inicio and fin and fin <= inicio:
            raise ValueError('La fecha de finalización debe ser posterior a la fecha de inicio.')
        if not es_publica and (not whitelist or len(whitelist) == 0):
            raise ValueError('Una oferta privada (VIP) debe tener al menos un cliente en la whitelist.')
        return values


class PublicacionCreate(BaseModel):
    """Payload para crear una publicación en el feed del negocio."""
    titulo: str
    descripcion: str
    url_imagen: Optional[str] = None
    id_oferta: Optional[int] = None
    habilitar_comentarios: bool = True


class ComentarioCreate(BaseModel):
    """
    Payload para crear un comentario.
    Arco exclusivo: debe apuntar a Publicación O a Oferta, nunca a ambos.
    """
    id_publicacion: Optional[int] = None
    id_oferta: Optional[int] = None
    texto_comentario: str

    @model_validator(mode='after')
    def validar_arco_exclusivo(self):
        tiene_publicacion = self.id_publicacion is not None
        tiene_oferta = self.id_oferta is not None

        if tiene_publicacion == tiene_oferta:
            raise ValueError(
                'Un comentario debe apuntar a una Publicación O a una Oferta, nunca a ambos ni a ninguno.'
            )
        return self


# ==========================================
# SCHEMAS PARA ACTUALIZACIÓN (PUT)
# ==========================================

class OfertaUpdate(BaseModel):
    """Payload para actualizar textos o estado de una oferta existente."""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None


class PublicacionUpdate(BaseModel):
    """Payload para actualizar textos o permisos de una publicación."""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    habilitar_comentarios: Optional[bool] = None


class ProductoEstrellaCreate(BaseModel):
    """Producto estrella para configurar multiplicador."""
    id_servicio_producto: int
    multiplicador_producto: float = 1.0


class ProductoEstrellaResponse(BaseModel):
    """Producto estrella serializado con datos del servicio."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_servicio_producto: int
    nombre_servicio: Optional[str] = None
    tipo_servicio: Optional[str] = None
    url_imagen: Optional[str] = None
    multiplicador_producto: float


class ConfiguracionLealtadUpdate(BaseModel):
    """Payload para actualizar las reglas del programa de lealtad."""
    tasa_puntos_por_peso: Optional[float] = None
    puntos_por_visita: Optional[int] = None
    meses_vigencia_puntos: Optional[int] = None
    productos_estrella: Optional[List[ProductoEstrellaCreate]] = None


# ==========================================
# SCHEMAS PARA LECTURA (RESPUESTAS)
# ==========================================

class MetricasSucursal(BaseModel):
    """Métricas de calificación de una sucursal individual."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str = ""
    calificacion: float
    total_resenas: int


class OfertaResponse(BaseModel):
    """Oferta completa con sus reglas NxN serializadas."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_sucursales: int
    nombre_sucursal: str
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    limite_existencias: Optional[int] = None
    limite_por_usuario: Optional[int] = None
    es_publica: bool
    costo_en_puntos: Optional[float] = None
    premio_en_puntos: Optional[float] = None
    premio_en_sellos: Optional[int] = None
    estado: str
    total_canjes: int = 0
    stock_restante: Optional[int] = None
    reglas: List[OfertaReglaResponse] = []


class PublicacionResponse(BaseModel):
    """Publicación del feed serializada para respuesta API."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_negocio: int
    id_oferta: Optional[int] = None
    titulo: str
    descripcion: str
    url_imagen: Optional[str] = None
    habilitar_comentarios: bool
    fecha_publicacion: datetime


class ComentarioResponse(BaseModel):
    """Comentario serializado. Respeta el arco exclusivo (uno de los dos IDs es None)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_publicacion: Optional[int] = None
    id_oferta: Optional[int] = None
    id_usuario_consumidor: int
    texto_comentario: str
    fecha_comentario: datetime
    esta_oculto: bool


class ConfiguracionLealtadResponse(BaseModel):
    """Reglas del programa de lealtad de un negocio."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_negocio: int
    tasa_puntos_por_peso: float
    puntos_por_visita: int
    meses_vigencia_puntos: int
    productos_estrella: List[ProductoEstrellaResponse] = []


class DashboardLealtadResponse(BaseModel):
    """
    Respuesta consolidada del dashboard de lealtad.
    feed_items usa List[dict] porque combina ofertas y publicaciones
    en un formato unificado para el FlatList del frontend.
    """
    model_config = ConfigDict(from_attributes=True)

    calificacion_global: float
    total_resenas_globales: int
    sucursales: List[MetricasSucursal]
    feed_items: List[dict]


# ==========================================
# SCHEMAS PARA QR Y CANJES
# ==========================================

class QRTokenResponse(BaseModel):
    """Token JWT de corta duración para renderizar un código QR de canje."""
    model_config = ConfigDict(from_attributes=True)

    token_qr: str
    expira_en_segundos: int


class CanjearQRRequest(BaseModel):
    """Payload para canjear un QR: token firmado + transacción de caja."""
    token_qr: str
    id_transaccion: int


class CanjeResponse(BaseModel):
    """Confirmación de canje exitoso."""
    model_config = ConfigDict(from_attributes=True)

    mensaje: str
    id_uso: int
    titulo_oferta: str
    descuento_aplicado: str
    puntos_otorgados: Optional[float] = None
    sellos_otorgados: Optional[int] = None
    saldo_puntos_actual: float
    saldo_sellos_actual: int
