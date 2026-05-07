from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

# Importamos la conexión a la BD y nuestros modelos de usuarios
from backend.core.database import get_db
from backend.usuarios import models as usuarios_models
from backend.auth import schemas

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)

# ==========================================
# 🌟 DEPENDENCIA CENTRAL DE SEGURIDAD
# ==========================================
def obtener_id_desde_token(authorization: str = Header(...)):
    """
    Extrae el ID del usuario desde el token simulado enviado por el Frontend.
    Ejemplo: 'Bearer fake-jwt-token-para-5' -> Extrae el 5
    """
    try:
        token = authorization.split(" ")[1]
        user_id = int(token.split("-")[-1])
        return user_id
    except:
        raise HTTPException(status_code=401, detail="Token inválido o no proporcionado")

# ==========================================
# ENDPOINTS
# ==========================================
@router.post("/login", response_model=schemas.TokenResponse)
def iniciar_sesion(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Valida las credenciales del usuario y devuelve un token de acceso.
    """
    usuario_db = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.correo == credenciales.correo).first()
    
    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico no está registrado."
        )
        
    if usuario_db.contrasena != credenciales.contrasena:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta."
        )
        
    token_simulado = f"fake-jwt-token-para-{usuario_db.id}"
    
    return {
        "access_token": token_simulado,
        "token_type": "bearer",
        "id_usuario": usuario_db.id,
        "nombre": usuario_db.nombre,
        "es_admin": usuario_db.es_admin_sistema
    }