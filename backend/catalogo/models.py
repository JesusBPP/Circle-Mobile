from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from backend.core.database import Base

# ==========================================
# 3. PRODUCTOS, SERVICIOS Y MATERIALES (Soluciones 3 y 4)
# ==========================================

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

    # 🌟 NUEVO: Relación con configuraciones de lealtad
    # Permite saber en qué negocios este producto da puntos dobles
    configuraciones_lealtad = relationship("ConfiguracionLealtad", back_populates="producto_estrella")


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