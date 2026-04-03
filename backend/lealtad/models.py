from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean
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