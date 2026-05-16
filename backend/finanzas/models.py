"""
===============================================================================
DOMINIO: FINANZAS Y POS (Punto de Venta)
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos exclusivo para la gestión 
financiera, auditoría de cajas, turnos de empleados, control de flujo de efectivo 
y el registro maestro de ventas (cobros).

Tablas exactas contenidas en este archivo:
1. cajas_fisicas
2. sesiones_caja
3. movimientos_efectivo
4. transacciones
5. detalle_transacciones
===============================================================================
"""

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base


class CajaFisica(Base):
    __tablename__ = "cajas_fisicas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)
    
    nombre = Column(String, nullable=False) # Ej: 'Caja Mostrador'
    esta_activa = Column(Boolean, default=True, nullable=False)


class SesionCaja(Base):
    __tablename__ = "sesiones_caja"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_caja_fisica = Column(Integer, ForeignKey("cajas_fisicas.id"), nullable=False)
    id_usuario = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    fondo_inicial = Column(Numeric(10, 2), default=0.0, nullable=False)
    fecha_apertura = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    fecha_cierre = Column(DateTime, nullable=True)
    efectivo_contado_al_cierre = Column(Numeric(10, 2), nullable=True)


class MovimientoEfectivo(Base):
    __tablename__ = "movimientos_efectivo"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_sesion_caja = Column(Integer, ForeignKey("sesiones_caja.id"), nullable=False)
    
    tipo_movimiento = Column(String, nullable=False) # 'ingreso' o 'egreso'
    monto = Column(Numeric(10, 2), nullable=False)
    concepto = Column(String, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)


class Transaccion(Base):
    __tablename__ = "transacciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario_consumidor = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # Enlace opcional a la sesión de caja
    id_sesion_caja = Column(Integer, ForeignKey("sesiones_caja.id"), nullable=True)
    
    monto_total = Column(Numeric(10, 2), nullable=False)
    metodo_pago = Column(String, nullable=False) # 'efectivo', 'tarjeta', 'transferencia', 'puntos'
    estado_pago = Column(String, default="completado", nullable=False)
    
    fecha_transaccion = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones con otros dominios (Patrón Observer a futuro)
    movimientos_lealtad = relationship("HistorialMovimientoLealtad", back_populates="transaccion")


class DetalleTransaccion(Base):
    __tablename__ = "detalle_transacciones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_transaccion = Column(Integer, ForeignKey("transacciones.id"), nullable=False)
    id_servicios_productos_disponibles = Column(Integer, ForeignKey("servicios_disponibles.id"), nullable=True)
    
    cantidad = Column(Integer, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
El dominio de Finanzas (POS) es el responsable exclusivo de la "Verdad Financiera" 
del ecosistema. Se encarga de registrar el intercambio de valor y la auditoría.

- Se extrajo 'Transacciones' y 'Detalle_Transacciones' del dominio de Agenda para 
  desacoplar los cobros de las citas. Ahora, un negocio puede cobrar en mostrador
  solo vendiendo productos, sin necesidad de usar la agenda.
- Introduce un sistema auditable de control de efectivo ('cajas_fisicas', 
  'sesiones_caja', 'movimientos_efectivo') para garantizar que los cortes de caja 
  cuadren con precisión matemática, protegiendo al dueño del negocio.
- Diseñado para tolerar "ventas huérfanas" de caja (id_sesion_caja nulo), lo que 
  permite cobrar suscripciones en la madrugada o ventas en línea sin abrir un turno.
===============================================================================
"""