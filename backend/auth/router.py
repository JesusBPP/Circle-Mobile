from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.usuarios import models as usuarios_models
from backend.auth import schemas
from backend.auth.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Autenticación"]
)


def obtener_id_desde_token(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if payload is None:
            raise HTTPException(status_code=401, detail="Token inválido o expirado")
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Tipo de token inválido")
        user_id = int(payload.get("sub"))
        return user_id
    except (IndexError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido o no proporcionado")


@router.post("/login", response_model=schemas.TokenResponse)
def iniciar_sesion(credenciales: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(usuarios_models.Usuario).filter(
        usuarios_models.Usuario.correo == credenciales.correo
    ).first()

    if not usuario_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico no está registrado."
        )

    if not verify_password(credenciales.contrasena, usuario_db.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta."
        )

    token_data = {"sub": str(usuario_db.id)}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "id_usuario": usuario_db.id,
        "nombre": usuario_db.nombre,
        "es_admin": usuario_db.es_admin_sistema
    }


@router.post("/refresh", response_model=schemas.TokenResponse)
def refrescar_tokens(request: schemas.RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)

    if payload is None:
        raise HTTPException(status_code=401, detail="Refresh token inválido o expirado")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Tipo de token inválido")

    user_id = int(payload.get("sub"))
    usuario_db = db.query(usuarios_models.Usuario).filter(
        usuarios_models.Usuario.id == user_id
    ).first()

    if not usuario_db:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    token_data = {"sub": str(usuario_db.id)}
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "id_usuario": usuario_db.id,
        "nombre": usuario_db.nombre,
        "es_admin": usuario_db.es_admin_sistema
    }
