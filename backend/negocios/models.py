from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

# ==========================================
# 2. CORE: NEGOCIOS, SUCURSALES Y EMPLEADOS
# ==========================================

class Negocio(Base):
    __tablename__ = "negocios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # LLAVES FORÁNEAS
    id_dueno = Column(Integer, ForeignKey("usuarios.id"), index=True, nullable=False)
    id_suscripcion = Column(Integer, ForeignKey("suscripciones.id"), nullable=False)
    
    nombre = Column(String, nullable=False)
    descripcion = Column(String) # Descripción general del negocio para su perfil
    fecha_creacion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # RELACIONES MÁGICAS
    sucursales = relationship("Sucursal", back_populates="negocio")


class Sucursal(Base):
    __tablename__ = "sucursales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # LLAVE FORÁNEA
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)
    
    nombre = Column(String, nullable=False)
    
    # Desglose de dirección (Obligatorios según DBML)
    calle = Column(String, nullable=False)
    numero_exterior = Column(String, nullable=False)
    numero_interior = Column(String) # Único campo opcional por si no aplica
    colonia = Column(String, nullable=False)
    ciudad = Column(String, nullable=False)
    estado = Column(String, nullable=False)
    pais = Column(String, default="México", nullable=False)
    codigo_postal = Column(String, nullable=False)
    
    # Caché de rendimiento para la App Móvil
    calificacion_promedio = Column(Numeric(3, 2)) 
    total_resenas = Column(Integer, default=0)

    # Relaciones Mágicas
    negocio = relationship("Negocio", back_populates="sucursales")
    empleados = relationship("EmpleadoSucursal", back_populates="sucursal")


class EmpleadoSucursal(Base):
    __tablename__ = "empleados_sucursal"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # LLAVES FORÁNEAS
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    
    estado_invitacion = Column(String, default="pendiente", nullable=False) # 'pendiente' o 'aceptada'
    permisos = Column(String, default="solo_operacion", nullable=False)

    # Relaciones Mágicas
    sucursal = relationship("Sucursal", back_populates="empleados")