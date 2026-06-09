"""
===============================================================================
DOMINIO: AGENDA
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos exclusivo para la gestión 
y operación del sistema de citas y reservas (Solución 1).

Tablas exactas contenidas en este archivo:
1. agenda_whitelist
2. citas
3. citas_servicios
4. archivos_citas
5. citas_consumidores
===============================================================================
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class AgendaWhitelist(Base):
    __tablename__ = "agenda_whitelist"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursales = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
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
    
    notas_internas = Column(String)
    estado = Column(String, default="programada", nullable=False)

    # Relaciones
    archivos = relationship("ArchivoCita", back_populates="cita")
    consumidores = relationship("CitaConsumidor", back_populates="cita")


class CitaServicio(Base):
    __tablename__ = "citas_servicios"
    id_cita = Column(Integer, ForeignKey("citas.id"), primary_key=True, nullable=False)
    id_servicio_disponible = Column(Integer, ForeignKey("servicios_disponibles.id"), primary_key=True, nullable=False)
    costo_actual = Column(Numeric(10, 2), nullable=False)


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


"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
Estas tablas se aíslan en el dominio 'Agenda' porque su única responsabilidad 
es la gestión del tiempo, los recursos (servicios a realizar) y la asistencia. 

- CitaServicio congela qué servicio se agendó, pero NO realiza el cobro.
- CitaConsumidor define quiénes asistirán a la cita (CRM local), pero no 
  almacena el perfil global del usuario ni su segmentación.

Separar esto garantiza que si un negocio apaga el módulo de Agenda, los módulos 
de Finanzas (cobros) y Usuarios (CRM) sigan funcionando sin dependencias rotas.
===============================================================================
"""