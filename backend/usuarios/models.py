"""
===============================================================================
DOMINIO: USUARIOS (Identidad e Inteligencia)
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos para la gestión 
de identidades, autenticación, control de cuotas de suscripción SaaS 
y el perfilamiento inteligente de los consumidores (CRM).

Tablas exactas contenidas en este archivo:
1. usuarios
2. suscripciones
3. crm_clientes_negocio
===============================================================================
"""

from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship 
from datetime import datetime
from backend.core.database import Base

# ==========================================
# GESTIÓN SAAS: SUSCRIPCIONES
# ==========================================

class Suscripcion(Base):
    __tablename__ = "suscripciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_plan = Column(String, nullable=False)  # Ej: 'Gratis', 'Premium'
    
    # Límites operativos del plan (SaaS Quotas)
    limite_soluciones = Column(Integer, nullable=False) # Ej: 3 para Gratis
    limite_sucursales = Column(Integer, nullable=False) # Ej: 1 para Gratis
    limite_empleados = Column(Integer, nullable=False)  # Ej: 15 para Gratis
    limite_consumidores = Column(Integer, nullable=False) # Ej: 100 para Gratis
    limite_productos = Column(Integer, nullable=False)    # Ej: 50 para Gratis


# ==========================================
# NÚCLEO: IDENTIDAD ÚNICA (Single Sign-On)
# ==========================================

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

    # Relaciones de Lealtad (Identidad a través de los negocios)
    carteras_lealtad = relationship("CarteraLealtad", back_populates="usuario")


# ==========================================
# INTELIGENCIA: CRM Y SEGMENTACIÓN
# ==========================================

class CRMClienteNegocio(Base):
    __tablename__ = "crm_clientes_negocio"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Llaves foráneas
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    # Datos analíticos (Motor de Inteligencia)
    segmento_calculado = Column(String) # Ej: 'Leal', 'Riesgo', 'Cazador' - Llenado por un proceso cron/Job
    fecha_ultima_visita = Column(DateTime)


"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
El dominio de 'Usuarios' es la capa fundacional del ecosistema Circle. Opera bajo 
una arquitectura de "Identidad Global" o Single Sign-On (SSO) interno.

- La tabla 'usuarios' centraliza a las personas. En la base de datos no existe 
  diferencia entre un "dueño", un "empleado" o un "consumidor". Eres simplemente 
  un Usuario. Tus privilegios o "roles" se calculan dinámicamente dependiendo 
  de en qué otras tablas aparezca tu ID (Ej. Si tu ID está en la tabla 'negocios' 
  del dominio Negocios, entonces actúas como Dueño).
- La tabla 'suscripciones' se aloja aquí porque dicta los límites globales 
  permitidos para el dueño del ecosistema, afectando a todos los demás dominios.
- 'crm_clientes_negocio' se incluye aquí porque pertenece a la Inteligencia de 
  Usuarios. No gestiona transacciones ni citas; su única responsabilidad es 
  almacenar metadatos analíticos (segmentación) para entender el comportamiento 
  de las personas.
===============================================================================
"""