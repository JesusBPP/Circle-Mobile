from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import get_db
from backend.usuarios import models, schemas
from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models

# 🌟 IMPORTAMOS LA SEGURIDAD DESDE AUTH
from backend.auth.router import obtener_id_desde_token

router = APIRouter(
    prefix="/api/usuarios",
    tags=["Usuarios"]
)

@router.get("/me/dashboard", response_model=schemas.DashboardResponse)
def obtener_datos_dashboard(
    db: Session = Depends(get_db), 
    usuario_id: int = Depends(obtener_id_desde_token) # 🌟 USAMOS LA DEPENDENCIA IMPORTADA
):
    """
    Consulta relacional para obtener los datos de bienvenida del Dueño.
    """
    usuario = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    negocio = db.query(negocios_models.Negocio).filter(negocios_models.Negocio.id_dueno == usuario_id).first()
    
    nombre_negocio = "Sin Negocio"
    nombre_sucursal = "Sin Sucursal"
    id_negocio = None # 🌟 INICIALIZAMOS EL ID
    
    if negocio:
        nombre_negocio = negocio.nombre
        id_negocio = negocio.id # 🌟 LO ASIGNAMOS
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id_negocio == negocio.id).first()
        if sucursal:
            nombre_sucursal = sucursal.nombre
        
    # 🌟 SENSOR DE RASTREO BACKEND:
    respuesta = {
        "nombre_usuario": usuario.nombre,
        "nombre_negocio": nombre_negocio,
        "nombre_sucursal": nombre_sucursal,
        "id_negocio": id_negocio 
    }
    print(f"🕵️ BACKEND ENVIANDO AL CELULAR: {respuesta}")

    return {
        "nombre_usuario": usuario.nombre,
        "nombre_negocio": nombre_negocio,
        "nombre_sucursal": nombre_sucursal,
        "id_negocio": id_negocio # 🌟 LO DEVOLVEMOS PARA EL FRONTEND
    }


@router.post("/", response_model=schemas.UsuarioResponse, status_code=status.HTTP_201_CREATED)
def crear_usuario(usuario: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    db_usuario = db.query(models.Usuario).filter(models.Usuario.correo == usuario.correo).first()
    if db_usuario:
        raise HTTPException(status_code=400, detail="El correo ya está registrado en Circle.")
    
    nuevo_usuario = models.Usuario(**usuario.model_dump())
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.get("/", response_model=List[schemas.UsuarioResponse])
def obtener_usuarios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    usuarios = db.query(models.Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.get("/{usuario_id}", response_model=schemas.UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return usuario