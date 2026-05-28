from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.auth.router import obtener_id_desde_token
from backend.lealtad import schemas, service

router = APIRouter(
    prefix="/api/lealtad",
    tags=["Lealtad"]
)

# ==========================================
# ENDPOINTS PRINCIPALES (DASHBOARD Y CREACIÓN)
# ==========================================

@router.get("/negocios/{id_negocio}/dashboard", response_model=schemas.DashboardLealtadResponse)
def obtener_dashboard(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve las métricas consolidadas, ofertas y publicaciones para el SPA de Lealtad"""
    return service.obtener_dashboard_negocio(db, id_negocio)

@router.post("/negocios/{id_negocio}/ofertas", status_code=status.HTTP_201_CREATED)
def crear_oferta(
    id_negocio: int,
    oferta: schemas.OfertaCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Crea una nueva promoción, aplicando whitelist si es requerida."""
    try:
        return service.crear_oferta_negocio(db, id_negocio, oferta)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/negocios/{id_negocio}/publicaciones", status_code=status.HTTP_201_CREATED)
def crear_publicacion(
    id_negocio: int,
    publicacion: schemas.PublicacionCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Publica un anuncio en el Feed del negocio."""
    return service.crear_publicacion_negocio(db, id_negocio, publicacion)

# ==========================================
# 🌟 NUEVO: ENDPOINTS DE ACTUALIZACIÓN Y ELIMINACIÓN
# ==========================================

@router.put("/ofertas/{id_oferta}")
def actualizar_oferta(
    id_oferta: int,
    datos: schemas.OfertaUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Actualiza textos o cambia el estado (Activa/Inactiva) de una Oferta."""
    return service.actualizar_oferta(db, id_oferta, datos)

@router.delete("/ofertas/{id_oferta}")
def eliminar_oferta(
    id_oferta: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Elimina permanentemente una oferta, solo si no tiene canjes registrados."""
    return service.eliminar_oferta(db, id_oferta)

@router.put("/publicaciones/{id_publicacion}")
def actualizar_publicacion(
    id_publicacion: int,
    datos: schemas.PublicacionUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Actualiza textos o permisos de comentarios de una Publicación."""
    return service.actualizar_publicacion(db, id_publicacion, datos)

@router.delete("/publicaciones/{id_publicacion}")
def eliminar_publicacion(
    id_publicacion: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Elimina permanentemente una publicación del Feed."""
    return service.eliminar_publicacion(db, id_publicacion)

# ==========================================
# ENDPOINTS LOGÍSTICA QR (Totalmente delegados al Service)
# ==========================================

@router.get("/ofertas/{id_oferta}/generar-token-qr", response_model=schemas.QRTokenResponse)
def generar_token_qr(
    id_oferta: int, 
    db: Session = Depends(get_db), 
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Genera un token JWT seguro de corta duración para renderizar el código QR."""
    return service.generar_token_qr_logic(db, id_oferta, usuario_id)

@router.post("/ofertas/canjear-qr", response_model=schemas.CanjeResponse)
def canjear_qr(
    request: schemas.CanjearQRRequest, 
    db: Session = Depends(get_db), 
    empleado_id: int = Depends(obtener_id_desde_token)
):
    """Desencripta el QR, audita los límites y efectúa la redención en el POS."""
    return service.canjear_qr_logic(db, request, empleado_id)