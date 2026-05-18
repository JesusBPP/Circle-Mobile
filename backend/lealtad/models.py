"""
===============================================================================
DOMINIO: LEALTAD Y PROMOCIONES (CRM Social)
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos exclusivo para el programa 
de fidelización, el motor matemático de ofertas dinámicas (NxN) y el feed de 
publicaciones o red social interna del negocio (Solución 5).

Tablas exactas contenidas en este archivo:
1. resenas_sucursales
2. ofertas
3. ofertas_reglas
4. ofertas_whitelist
5. historial_uso_ofertas
6. configuracion_lealtad
7. carteras_lealtad
8. historial_movimientos_lealtad
9. publicaciones
10. comentarios_publicaciones
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
    __tablename__ = "resenas_sucursales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    puntuacion = Column(Integer, nullable=False) # Ej: 1 al 5 estrellas
    comentario = Column(String)
    fecha_resena = Column(DateTime, default=datetime.utcnow, nullable=False)


# ==========================================
# MOTOR DE REGLAS (OFERTAS DINÁMICAS N x N)
# ==========================================

class Oferta(Base):
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
    
    # 🌟 NUEVO CAMPO AÑADIDO: Control de flujo (estado manual)
    estado = Column(String, default="activa", nullable=False) 


class OfertaRegla(Base):
    __tablename__ = "ofertas_reglas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    tipo_regla = Column(String, nullable=False) # 'requisito' o 'recompensa'
    
    id_servicio_disponible = Column(Integer, ForeignKey("servicios_disponibles.id"))
    cantidad = Column(Integer)
    
    porcentaje_descuento = Column(Numeric(5, 2))
    monto_descuento = Column(Numeric(10, 2))
    monto_minimo = Column(Numeric(10, 2))


class OfertaWhitelist(Base):
    __tablename__ = "ofertas_whitelist"

    id_oferta = Column(Integer, ForeignKey("ofertas.id"), primary_key=True, nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), primary_key=True, nullable=False)


class HistorialUsoOferta(Base):
    __tablename__ = "historial_uso_ofertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=False)
    
    fecha_uso = Column(DateTime, default=datetime.utcnow, nullable=False)


# ==========================================
# MÓDULO DE LEALTAD (Puntos y Sellos)
# ==========================================

class ConfiguracionLealtad(Base):
    __tablename__ = "configuracion_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), unique=True, nullable=False)
    
    tasa_puntos_por_peso = Column(Numeric(10, 2), default=0.0)
    puntos_por_visita = Column(Integer, default=0)
    
    id_producto_estrella = Column(Integer, ForeignKey("servicios_productos.id"), nullable=True)
    multiplicador_producto = Column(Numeric(5, 2), default=1.0)
    
    meses_vigencia_puntos = Column(Integer, default=12)

    negocio = relationship("Negocio", back_populates="configuracion_lealtad")
    producto_estrella = relationship("ServicioProducto", back_populates="configuraciones_lealtad")


class CarteraLealtad(Base):
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
    __tablename__ = "historial_movimientos_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cartera = Column(Integer, ForeignKey("carteras_lealtad.id"), nullable=False)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=True)
    
    tipo_movimiento = Column(String, nullable=False) # 'acumulacion' o 'canje'
    monto_puntos = Column(Numeric(10, 2), default=0.0)
    monto_sellos = Column(Integer, default=0)
    descripcion = Column(String)
    fecha_movimiento = Column(DateTime, default=datetime.utcnow, nullable=False)

    cartera = relationship("CarteraLealtad", back_populates="movimientos")
    transaccion = relationship("Transaccion", back_populates="movimientos_lealtad")


# ==========================================
# MÓDULO DE FEED / PUBLICACIONES
# ==========================================

class Publicacion(Base):
    __tablename__ = "publicaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)
    
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=True)
    
    titulo = Column(String, nullable=False)
    descripcion = Column(String, nullable=False)
    url_imagen = Column(String)
    
    habilitar_comentarios = Column(Boolean, default=True, nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow, nullable=False)


class ComentarioPublicacion(Base):
    __tablename__ = "comentarios_publicaciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_publicacion = Column(Integer, ForeignKey("publicaciones.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    texto_comentario = Column(String, nullable=False)
    fecha_comentario = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # 🌟 NUEVO CAMPO AÑADIDO: Soft Delete para auditoría
    esta_oculto = Column(Boolean, default=False, nullable=False)

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