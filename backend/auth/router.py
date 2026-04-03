from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Importamos la conexión a la BD y nuestros modelos de usuarios
from backend.core.database import get_db
from backend.usuarios import models as usuarios_models
from backend.auth import schemas

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)

@router.post("/login", response_model=schemas.TokenResponse)
def iniciar_sesion(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Valida las credenciales del usuario y devuelve un token de acceso.
    """
    
    # 1. Buscar al usuario por su correo en la base de datos
    usuario_db = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.correo == credenciales.correo).first()
    
    # 2. Validar si el correo existe
    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico no está registrado."
        )
        
    # 3. Validar la contraseña
    # NOTA TEMPORAL: Por ahora comparamos texto plano. En el futuro, aquí usaremos una función de Hash (bcrypt).
    if usuario_db.contrasena != credenciales.contrasena:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta."
        )
        
    # 4. Generar el Gafete Virtual (Token)
    # Por ahora devolveremos un token simulado. Más adelante instalaremos la librería JWT para generar uno real encriptado.
    token_simulado = f"fake-jwt-token-para-{usuario_db.id}"
    
    # 5. Devolver la respuesta al celular
    return {
        "access_token": token_simulado,
        "token_type": "bearer",
        "id_usuario": usuario_db.id,
        "nombre": usuario_db.nombre,
        "es_admin": usuario_db.es_admin_sistema
    }