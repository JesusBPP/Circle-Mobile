"""
===============================================================================
MÓDULO: LEALTAD — MODELOS DE BASE DE DATOS
===============================================================================
Propósito:
    Define las clases SQLAlchemy que mapean las 10 tablas del dominio de Lealtad
    y Promociones contra PostgreSQL. Cada clase representa una tabla y sus
    relationships definen el grafo de navegación entre entidades.

Qué DEBE ir aquí:
    - Clases SQLAlchemy con Column, ForeignKey, relationship
    - Constraints de tabla (UniqueConstraint, CheckConstraint)
    - Mapeo 1:1 contra arquitectura_db.dbml

Qué NO debe ir aquí:
    - Lógica de negocio (va en service.py)
    - Validaciones de entrada (van en schemas.py)
    - Endpoints HTTP (van en router.py)
    - Configuración de secretos (van en config.py)

Dependencias de otros archivos del dominio:
    - service.py importa models para hacer queries y crear registros
    - router.py importa models indirectamente a través de service.py
    - schemas.py usa model_validate() para convertir models → response

Tablas contenidas (10):
    1. resenas_sucursales — Calificaciones de consumidores a sucursales
    2. ofertas — Promociones creadas por el dueño del negocio
    3. ofertas_reglas — Motor NxN: bloques de requisitos y recompensas
    4. ofertas_whitelist — Exclusividad VIP de ofertas privadas
    5. historial_uso_ofertas — Auditoría de canjes QR
    6. configuracion_lealtad — Reglas del programa de puntos/sellos
    7. carteras_lealtad — Billetera de puntos por consumidor/negocio
    8. historial_movimientos_lealtad — Estado de cuenta del consumidor
    9. publicaciones — Feed / red social del negocio
    10. comentarios — Arco exclusivo: comentarios en publicaciones U ofertas
===============================================================================
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base


# ==========================================
# RESEÑAS DE SUCURSAL
# ==========================================

class ResenaSucursal(Base):
    """Calificación (1-5 estrellas) que un consumidor otorga a una sucursal."""
    __tablename__ = "resenas_sucursales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    puntuacion = Column(Integer, nullable=False)
    comentario = Column(String)
    fecha_resena = Column(DateTime, default=datetime.utcnow, nullable=False)

    sucursal = relationship("Sucursal")
    consumidor = relationship("Usuario")


# ==========================================
# MOTOR DE REGLAS (OFERTAS DINÁMICAS N x N)
# ==========================================

class Oferta(Base):
    """Promoción creada por el dueño. Puede tener N reglas (requisitos + recompensas)."""
    __tablename__ = "ofertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)

    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    limite_existencias = Column(Integer)
    limite_por_usuario = Column(Integer, nullable=True)

    es_publica = Column(Boolean, default=True, nullable=False)
    costo_en_puntos = Column(Numeric(10, 2), nullable=True)
    premio_en_puntos = Column(Numeric(10, 2), nullable=True)
    premio_en_sellos = Column(Integer, nullable=True)

    estado = Column(String, default="activa", nullable=False)

    sucursal = relationship("Sucursal")
    reglas = relationship("OfertaRegla", back_populates="oferta", cascade="all, delete-orphan")
    whitelist = relationship("OfertaWhitelist", back_populates="oferta", cascade="all, delete-orphan")
    usos = relationship("HistorialUsoOferta", back_populates="oferta")
    comentarios = relationship("Comentario", back_populates="oferta")


class OfertaRegla(Base):
    """Bloque de Lego del motor NxN: un requisito o una recompensa para una oferta."""
    __tablename__ = "ofertas_reglas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    tipo_regla = Column(String, nullable=False)  # 'requisito' o 'recompensa'

    # Relationships
    oferta = relationship("Oferta", back_populates="reglas")
    servicios = relationship("OfertaReglaServicio", back_populates="regla", cascade="all, delete-orphan")


class OfertaReglaServicio(Base):
    """Tabla intermedia: conecta una regla con múltiples productos/servicios."""
    __tablename__ = "ofertas_reglas_servicios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta_regla = Column(Integer, ForeignKey("ofertas_reglas.id"), nullable=False)
    id_servicio_disponible = Column(Integer, ForeignKey("servicios_disponibles.id"), nullable=False)
    
    # Atributos específicos por producto/servicio
    cantidad = Column(Integer, default=1)
    porcentaje_descuento = Column(Numeric(5, 2))
    monto_descuento = Column(Numeric(10, 2))
    monto_minimo = Column(Numeric(10, 2))  # Solo para requisitos
    
    # Relationships
    regla = relationship("OfertaRegla", back_populates="servicios")
    servicio_disponible = relationship("ServicioDisponible")


class OfertaWhitelist(Base):
    """Registro de consumidores con acceso exclusivo a una oferta privada (VIP)."""
    __tablename__ = "ofertas_whitelist"

    id_oferta = Column(Integer, ForeignKey("ofertas.id"), primary_key=True, nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), primary_key=True, nullable=False)

    oferta = relationship("Oferta", back_populates="whitelist")
    consumidor = relationship("Usuario")


class HistorialUsoOferta(Base):
    """Auditoría: quién canjeó qué oferta, en qué transacción y cuándo."""
    __tablename__ = "historial_uso_ofertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=False)

    fecha_uso = Column(DateTime, default=datetime.utcnow, nullable=False)

    oferta = relationship("Oferta", back_populates="usos")
    consumidor = relationship("Usuario")
    transaccion = relationship("Transaccion")


# ==========================================
# MÓDULO DE LEALTAD (Puntos y Sellos)
# ==========================================

class ConfiguracionLealtad(Base):
    """Reglas del juego: cómo se acumulan puntos/sellos en un negocio."""
    __tablename__ = "configuracion_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), unique=True, nullable=False)

    tasa_puntos_por_peso = Column(Numeric(10, 2), default=0.0)
    puntos_por_visita = Column(Integer, default=0)

    meses_vigencia_puntos = Column(Integer, default=12)

    negocio = relationship("Negocio", back_populates="configuracion_lealtad")
    productos_estrella = relationship("ConfiguracionProductoEstrella", back_populates="configuracion", cascade="all, delete-orphan")


class ConfiguracionProductoEstrella(Base):
    """Producto estrella con multiplicador: tabla intermedia para soportar múltiples productos."""
    __tablename__ = "configuracion_productos_estrella"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_configuracion_lealtad = Column(Integer, ForeignKey("configuracion_lealtad.id"), nullable=False)
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"), nullable=False)
    multiplicador_producto = Column(Numeric(5, 2), default=1.0, nullable=False)

    configuracion = relationship("ConfiguracionLealtad", back_populates="productos_estrella")
    servicio_producto = relationship("ServicioProducto")


class CarteraLealtad(Base):
    """Billetera del consumidor: saldo de puntos y sellos en un negocio específico."""
    __tablename__ = "carteras_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)

    saldo_puntos = Column(Numeric(10, 2), default=0.0)
    saldo_sellos = Column(Integer, default=0)
    fecha_ultima_acumulacion = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('id_usuario_consumidor', 'id_negocio', name='idx_cartera_unica_por_negocio'),
    )

    usuario = relationship("Usuario", back_populates="carteras_lealtad")
    negocio = relationship("Negocio", back_populates="carteras_lealtad")
    movimientos = relationship("HistorialMovimientoLealtad", back_populates="cartera")


class HistorialMovimientoLealtad(Base):
    """Estado de cuenta: cada acumulación o canje de puntos/sellos."""
    __tablename__ = "historial_movimientos_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cartera = Column(Integer, ForeignKey("carteras_lealtad.id"), nullable=False)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=True)

    tipo_movimiento = Column(String, nullable=False)
    monto_puntos = Column(Numeric(10, 2), default=0.0)
    monto_sellos = Column(Integer, default=0)
    descripcion = Column(String)
    fecha_movimiento = Column(DateTime, default=datetime.utcnow, nullable=False)

    cartera = relationship("CarteraLealtad", back_populates="movimientos")
    transaccion = relationship("Transaccion", back_populates="movimientos_lealtad")


# ==========================================
# MÓDULO DE FEED Y COMENTARIOS
# ==========================================

class Publicacion(Base):
    """Anuncio publicado en el feed del negocio. Opcionalmente vinculado a una oferta."""
    __tablename__ = "publicaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)

    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=True)

    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    url_imagen = Column(String)

    habilitar_comentarios = Column(Boolean, default=True, nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    negocio = relationship("Negocio")
    oferta = relationship("Oferta")
    comentarios = relationship("Comentario", back_populates="publicacion")


class Comentario(Base):
    """
    Comentario con patrón de Arco Exclusivo:
    apunta a Publicación O a Oferta, nunca a ambos simultáneamente.
    """
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    id_publicacion = Column(Integer, ForeignKey("publicaciones.id"), nullable=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=True)

    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    texto_comentario = Column(String, nullable=False)
    fecha_comentario = Column(DateTime, default=datetime.utcnow, nullable=False)

    esta_oculto = Column(Boolean, default=False, nullable=False)

    publicacion = relationship("Publicacion", back_populates="comentarios")
    oferta = relationship("Oferta", back_populates="comentarios")
    consumidor = relationship("Usuario")


"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
El dominio de 'Lealtad' consolida toda la estrategia de retención y marketing.
Funciona como un motor reactivo (aplicando conceptos del Patrón Observer) respecto
al dominio de 'Finanzas': cuando ocurre una Transacción, Lealtad evalúa las reglas
definidas en 'configuracion_lealtad' u 'ofertas_reglas', y recompensa al cliente
modificando el saldo en su 'carteras_lealtad'.

Las 'publicaciones' actúan como el canal de comunicación del negocio hacia los
clientes (el Feed), permitiendo enlazar ofertas (NxN) de manera directa mediante
el id_oferta.

Este dominio se aísla completamente para garantizar que las reglas de negocio
de marketing (descuentos, vigencias, puntos) no contaminen el Catálogo maestro
ni interfieran con la inmutabilidad de los registros contables en Finanzas.
===============================================================================
"""
