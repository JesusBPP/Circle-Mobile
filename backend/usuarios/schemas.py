from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import date, datetime

# ==========================================
# SCHEMAS DE SUSCRIPCIONES
# ==========================================

class SuscripcionBase(BaseModel):
    nombre_plan: str
    limite_soluciones: int
    limite_sucursales: int
    limite_empleados: int
    limite_consumidores: int
    limite_productos: int

class SuscripcionResponse(SuscripcionBase):
    id: int

    # Esto permite que Pydantic lea los datos directamente de SQLAlchemy
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# SCHEMAS DE USUARIOS
# ==========================================

class UsuarioBase(BaseModel):
    nombre: str
    correo: EmailStr # Valida automáticamente que tenga el formato usuario@dominio.com
    fecha_nacimiento: Optional[date] = None
    
    # Dirección (Todos opcionales excepto CP y país por defecto)
    calle: Optional[str] = None
    numero_exterior: Optional[str] = None
    numero_interior: Optional[str] = None
    colonia: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    pais: str = "México"
    codigo_postal: str
    
    es_admin_sistema: bool = False

# Schema para CREAR un usuario (Exige la contraseña)
class UsuarioCreate(UsuarioBase):
    contrasena: str

# Schema para DEVOLVER un usuario (Oculta la contraseña por seguridad)
class UsuarioResponse(UsuarioBase):
    id: int
    fecha_registro: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema específico para la respuesta del Dashboard
class DashboardResponse(BaseModel):
    nombre_usuario: str
    nombre_negocio: str
    nombre_sucursal: str

    model_config = ConfigDict(from_attributes=True)