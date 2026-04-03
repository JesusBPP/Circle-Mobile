from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

# ==========================================
# 4. SOLUCIÓN 1: AGENDA INTELIGENTE
# ==========================================

class AgendaWhitelist(Base):
    __tablename__ = "agenda_whitelist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # Vinculado a sucursal en lugar de negocio
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    # Null si el usuario aún no se registra en Circle
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=True)


class Cita(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_hora_inicio = Column(DateTime, nullable=False)
    fecha_hora_fin = Column(DateTime, nullable=False)
    numero_bloques = Column(Integer, nullable=False)
    
    # El costo se calcula dinámicamente sumando los servicios asociados
    notas_internas = Column(String)
    estado = Column(String, default="programada", nullable=False)

    # Relaciones
    archivos = relationship("ArchivoCita", back_populates="cita")
    consumidores = relationship("CitaConsumidor", back_populates="cita")


class CitaServicio(Base):
    __tablename__ = "citas_servicios"
    id_cita = Column(Integer, ForeignKey("citas.id"), primary_key=True, nullable=False)
    # Vinculado a la tabla unificada de servicios_productos
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"), primary_key=True, nullable=False)


class ArchivoCita(Base):
    __tablename__ = "archivos_citas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_cita = Column(Integer, ForeignKey("citas.id"), nullable=False)
    
    url_archivo = Column(String, nullable=False)
    nombre_archivo = Column(String, nullable=False)
    tipo_archivo = Column(String, nullable=False)
    tamano_mb = Column(Numeric(6, 2)) 
    
    fecha_subida = Column(DateTime, default=datetime.utcnow, nullable=False)

    cita = relationship("Cita", back_populates="archivos")


class CitaConsumidor(Base):
    __tablename__ = "citas_consumidores"

    id_cita = Column(Integer, ForeignKey("citas.id"), primary_key=True, nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), primary_key=True, nullable=False)

    cita = relationship("Cita", back_populates="consumidores")


# ==========================================
# 5. INTELIGENCIA DE USUARIOS Y CRM
# ==========================================

class CRMClienteNegocio(Base):
    __tablename__ = "crm_clientes_negocio"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # Vinculado a sucursal
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    segmento_calculado = Column(String) # 'Leal', 'Riesgo', 'Cazador'
    fecha_ultima_visita = Column(DateTime)


# ==========================================
# TRANSACCIONES (Cajas y Cobros)
# ==========================================

class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    # Opcional: Agregamos id_sucursal para tener el rastro de dónde se hizo la venta
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    
    monto_total = Column(Numeric(10, 2), nullable=False)
    fecha_transaccion = Column(DateTime, default=datetime.utcnow, nullable=False)


class DetalleTransaccion(Base):
    __tablename__ = "detalle_transacciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=False)
    
    # Vinculamos directo a la disponibilidad en sucursal como marca tu DBML
    id_servicios_productos = Column(Integer, ForeignKey("servicios_disponibles.id"))
    
    cantidad = Column(Integer, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)