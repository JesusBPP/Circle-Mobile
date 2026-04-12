from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List

# Importamos la conexión a la BD y nuestros archivos locales del dominio
from backend.core.database import get_db
from backend.usuarios import models, schemas
from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models

# Creamos el enrutador
router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

# --- FUNCIÓN AUXILIAR DE AUTENTICACIÓN TEMPORAL ---
# Como estamos usando tokens simulados (fake-jwt-token-para-ID), 
# esta función extrae el ID del texto para saber quién está preguntando.
def obtener_id_desde_token(authorization: str = Header(...)):
    try:
        # Ejemplo: "Bearer fake-jwt-token-para-5" -> Extrae el 5
        token = authorization.split(" ")[1]
        user_id = int(token.split("-")[-1])
        return user_id
    except:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- ENDPOINT DEL DASHBOARD ---
@router.get("/me/dashboard", response_model=schemas.DashboardResponse)
def obtener_datos_dashboard(
    db: Session = Depends(get_db), 
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """
    Consulta relacional para obtener los datos de bienvenida del Dueño.
    """
    # 1. Buscar al usuario
    usuario = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 2. Buscar el Negocio del cual este usuario es dueño
    negocio = db.query(negocios_models.Negocio).filter(negocios_models.Negocio.id_dueno == usuario_id).first()
    
    # 3. Buscar la primera sucursal de ese negocio
    nombre_negocio = "Sin Negocio"
    nombre_sucursal = "Sin Sucursal"
    
    if negocio:
        nombre_negocio = negocio.nombre
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id_negocio == negocio.id).first()
        if sucursal:
            nombre_sucursal = sucursal.nombre

    # 4. Devolver el paquete de datos al frontend
    return {
        "nombre_usuario": usuario.nombre,
        "nombre_negocio": nombre_negocio,
        "nombre_sucursal": nombre_sucursal
    }

@router.post("/", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario en la base de datos.
    """
    # 1. Verificar si el correo ya existe en la BD
    db_usuario = db.query(models.Usuario).filter(models.Usuario.correo == usuario.correo).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado en Circle.")
    
    # 2. Convertir el Schema de Pydantic a un Modelo de SQLAlchemy
    # NOTA: En el futuro, aquí agregaremos la función para encriptar la contraseña (hashing)
    nuevo_usuario = models.Usuario(**usuario.model_dump())
    
    # 3. Guardar en PostgreSQL
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return nuevo_usuario


@router.get("/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtiene la lista de todos los usuarios registrados.
    """
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios


@router.get("/{usuario_id}", response_model=schemas.UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """
    Busca un usuario específico por su ID.
    """
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario