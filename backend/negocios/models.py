"""
===============================================================================
DOMINIO: NEGOCIOS (Estructura y App Store)
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos para la gestión 
empresarial, ubicaciones físicas, control de empleados y la tienda de 
soluciones (App Store interna del ecosistema).

Tablas exactas contenidas en este archivo:
1. negocios
2. sucursales
3. empleados_sucursal
4. soluciones
5. negocios_soluciones
===============================================================================
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

# ==========================================
# CORE: NEGOCIOS, SUCURSALES Y EMPLEADOS
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
    
    # Conexiones con el Programa de Lealtad
    configuracion_lealtad = relationship("ConfiguracionLealtad", back_populates="negocio", uselist=False)
    carteras_lealtad = relationship("CarteraLealtad", back_populates="negocio")
    
    # Conexión con las soluciones instaladas (App Store interna)
    soluciones_instaladas = relationship("NegocioSolucion", back_populates="negocio")


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


# ==========================================
# ECOSISTEMA Y SOLUCIONES (App Store)
# ==========================================

class Solucion(Base):
    __tablename__ = "soluciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False) # Ej: 'Agenda', 'Lealtad'
    descripcion = Column(String)
    
    ruta_frontend = Column(String) # Ej: '/agenda'
    
    # Control de Acceso
    es_premium_exclusiva = Column(Boolean, default=False, nullable=False)
    activa_en_catalogo = Column(Boolean, default=True, nullable=False)

    # Relación inversa
    negocios_instalados = relationship("NegocioSolucion", back_populates="solucion")


class NegocioSolucion(Base):
    __tablename__ = "negocios_soluciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_negocio = Column(Integer, ForeignKey("negocios.id"), nullable=False)
    id_solucion = Column(Integer, ForeignKey("soluciones.id"), nullable=False)
    
    fecha_instalacion = Column(DateTime, default=datetime.utcnow, nullable=False)
    esta_activa = Column(Boolean, default=True, nullable=False)

    # Restricción para no instalar la misma solución dos veces en el mismo negocio
    __table_args__ = (
        UniqueConstraint('id_negocio', 'id_solucion', name='idx_negocio_solucion_unica'),
    )

    # Relaciones inversas
    negocio = relationship("Negocio", back_populates="soluciones_instaladas")
    solucion = relationship("Solucion", back_populates="negocios_instalados")

"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
El dominio de 'Negocios' es el eje estructural (la columna vertebral) sobre el 
que operan los demás módulos operativos del ecosistema Circle.

- Separa la entidad 'Usuario' de la entidad 'Negocio'. Un usuario del sistema 
  solo adquiere el rol y privilegios de "Dueño" cuando su ID se registra aquí.
- Las 'sucursales' se gestionan aquí porque representan los espacios físicos. Son 
  el ancla territorial donde ocurren la 'Agenda', el 'Catálogo' y las 'Finanzas', 
  actuando también como frontera de acceso para los 'empleados_sucursal'.
- Las tablas 'soluciones' y 'negocios_soluciones' actúan como el App Store interna 
  de Circle. Dictaminan qué herramientas modulares tiene encendidas el negocio,
  habilitando que la plataforma funcione como un verdadero SaaS modular y no 
  como un monolito rígido.
===============================================================================
""" 