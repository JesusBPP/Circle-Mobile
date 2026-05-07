from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.orm import relationship # 🌟 NUEVO: Importación para relacionar tablas
from datetime import datetime
from backend.core.database import Base

# ==========================================
# 1. CORE: USUARIOS Y SUSCRIPCIONES
# ==========================================

class Suscripcion(Base):
    __tablename__ = "suscripciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_plan = Column(String, nullable=False)  # Ej: 'Gratis', 'Premium'
    
    # Límites operativos del plan
    limite_soluciones = Column(Integer, nullable=False) # Ej: 3 para Gratis
    limite_sucursales = Column(Integer, nullable=False) # Ej: 1 para Gratis
    limite_empleados = Column(Integer, nullable=False)  # Ej: 15 para Gratis
    limite_consumidores = Column(Integer, nullable=False) # Ej: 100 para Gratis
    limite_productos = Column(Integer, nullable=False)    # Ej: 50 para Gratis


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    
    # Index=True y unique=True para búsquedas ultra rápidas al hacer Login
    correo = Column(String, unique=True, index=True, nullable=False) 
    contrasena = Column(String, nullable=False)
    
    # Datos personales
    fecha_nacimiento = Column(Date) # Nota: Python calculará la edad dinámicamente con esto
    
    # Desglose de dirección (Todos opcionales excepto CP y País)
    calle = Column(String)
    numero_exterior = Column(String)
    numero_interior = Column(String)
    colonia = Column(String)
    ciudad = Column(String)
    estado = Column(String)
    pais = Column(String, default="México", nullable=False)
    codigo_postal = Column(String, nullable=False)
    
    fecha_registro = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # 👑 BANDERA DE SUPER ADMINISTRADOR
    es_admin_sistema = Column(Boolean, default=False, nullable=False) # Si es True, tiene acceso global a todo Circle

    # ==========================================
    # 🌟 NUEVO: RELACIONES MÁGICAS
    # ==========================================
    # Permite buscar cuántos puntos tiene este usuario en todos los negocios de Circle
    carteras_lealtad = relationship("CarteraLealtad", back_populates="usuario")