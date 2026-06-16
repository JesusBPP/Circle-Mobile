"""
===============================================================================
DOMINIO: CATÁLOGO
===============================================================================
Descripción: 
Este archivo contiene el modelado de la base de datos exclusivo para la gestión 
del catálogo unificado, inventarios, recetas y disponibilidad comercial 
(Soluciones 3 y 4 del ecosistema).

Tablas exactas contenidas en este archivo:
1. materiales
2. servicios_productos
3. proceso_servicio_producto
4. servicios_disponibles
===============================================================================
"""

from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from backend.core.database import Base


class Material(Base):
    __tablename__ = "materiales"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    url_imagen = Column(String)
    costo = Column(Numeric(10, 2), nullable=False)
    cantidad_existencia = Column(Numeric(10, 2), nullable=False)


class ServicioProducto(Base):
    __tablename__ = "servicios_productos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    descripcion = Column(String)
    url_imagen = Column(String)
    costo = Column(Numeric(10, 2), nullable=False)
    tipo_producto = Column(String, nullable=False) # 'servicio' o 'producto'


class ProcesoServicioProducto(Base):
    __tablename__ = "proceso_servicio_producto"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"), nullable=False)
    id_material = Column(Integer, ForeignKey("materiales.id"), nullable=False)
    
    cantidad = Column(Numeric(10, 2))
    ultimo_resurtido = Column(DateTime)


class ServicioDisponible(Base):
    __tablename__ = "servicios_disponibles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursales.id"), nullable=False)

"""
===============================================================================
CONTEXTO ARQUITECTÓNICO (¿Por qué estas tablas están aquí?):
-------------------------------------------------------------------------------
Estas tablas conforman el núcleo del inventario y la oferta comercial de los negocios.
Se aíslan en el dominio 'Catálogo' porque actúan como el "Diccionario Maestro".

- El dominio de 'Finanzas' consultará los 'servicios_disponibles' para saber el detalle de qué cobrar.
- El dominio de 'Agenda' consultará este dominio para saber qué servicios se pueden reservar.
- El dominio de 'Lealtad' lo consultará para definir reglas de recompensa (producto estrella y combos).

Al mantenerlo separado, garantizamos que el alta, baja o edición de un producto 
no interfiera con la lógica transaccional, de citas, o el programa de lealtad, 
logrando un desacoplamiento perfecto.
===============================================================================
"""