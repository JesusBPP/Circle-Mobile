from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Importamos la conexión a la BD y nuestros archivos locales del dominio
from backend.core.database import get_db
from backend.usuarios import models, schemas

# Creamos el enrutador
router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

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