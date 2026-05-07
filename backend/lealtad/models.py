from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

# ==========================================
# 6. SOLUCIÓN 5: PROGRAMA DE LEALTAD Y OFERTAS
# ==========================================

class ResenaSucursal(Base):
    __tablename__ = "resenas_sucursales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    puntuacion = Column(Integer, nullable=False) # Ej: 1 al 5 estrellas
    comentario = Column(String)
    fecha_resena = Column(DateTime, default=datetime.utcnow, nullable=False)


# --- MOTOR DE REGLAS (OFERTAS DINÁMICAS N x N) ---

class Oferta(Base):
    __tablename__ = "ofertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # Vinculado a sucursales en lugar de negocios
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    limite_existencias = Column(Integer)
    
    # Interruptor de rendimiento para no saturar la base de datos (Ignora Whitelist si es True)
    es_publica = Column(Boolean, default=True, nullable=False)
    
    # 🌟 NUEVO: Costo en puntos para canjear como recompensa
    costo_en_puntos = Column(Numeric(10, 2), nullable=True)


class OfertaRegla(Base):
    __tablename__ = "ofertas_reglas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    tipo_regla = Column(String, nullable=False) # 'requisito' o 'recompensa'
    
    # Vinculado a la tabla unificada del catálogo
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"))
    cantidad = Column(Integer)
    
    # Recompensas
    porcentaje_descuento = Column(Numeric(5, 2))
    monto_descuento = Column(Numeric(10, 2))
    
    # Requisitos
    monto_minimo = Column(Numeric(10, 2))


class OfertaWhitelist(Base):
    __tablename__ = "ofertas_whitelist"

    # Llave primaria compuesta para exclusividad
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), primary_key=True, nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), primary_key=True, nullable=False)


class HistorialUsoOferta(Base):
    __tablename__ = "historial_uso_ofertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("ofertas.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    fecha_uso = Column(DateTime, default=datetime.utcnow, nullable=False)


# ==========================================
# 🌟 7. NUEVO MÓDULO: LEALTAD (Puntos y Sellos)
# ==========================================

class ConfiguracionLealtad(Base):
    __tablename__ = "configuracion_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), unique=True, nullable=False)
    
    # Regla 1: Ticket ($ gastado)
    tasa_puntos_por_peso = Column(Numeric(10, 2), default=0.0)
    
    # Regla 2: Visitas (Sellos)
    puntos_por_visita = Column(Integer, default=0)
    
    # Regla 3: Producto Estrella (Multiplicadores)
    id_producto_estrella = Column(Integer, ForeignKey("servicios_productos.id"), nullable=True)
    multiplicador_producto = Column(Numeric(5, 2), default=1.0)
    
    # Regla de caducidad
    meses_vigencia_puntos = Column(Integer, default=12)

    # Relación Inversa
    negocio = relationship("Negocio", back_populates="configuracion_lealtad")
    
    # 🌟 AÑADIDO: Relación bidireccional con el Catálogo para el producto multiplicador
    producto_estrella = relationship("ServicioProducto", back_populates="configuraciones_lealtad")


class CarteraLealtad(Base):
    __tablename__ = "carteras_lealtad"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)
    
    saldo_puntos = Column(Numeric(10, 2), default=0.0)
    saldo_sellos = Column(Integer, default=0)
    fecha_ultima_acumulacion = Column(DateTime, default=datetime.utcnow)

    # 🌟 Restricción para que un usuario no tenga dos carteras en el mismo negocio
    __table_args__ = (
        UniqueConstraint('id_usuario_consumidor', 'id_negocio', name='idx_cartera_unica_por_negocio'),
    )

    # Relaciones Inversas
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

    # Relación Inversa
    cartera = relationship("CarteraLealtad", back_populates="movimientos")
    
    # 🌟 AÑADIDO: Relación bidireccional con Transacciones (Cajas y Cobros)
    transaccion = relationship("Transaccion", back_populates="movimientos_lealtad")