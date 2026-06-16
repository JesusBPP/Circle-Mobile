"""
===============================================================================
MÓDULO: LEALTAD — ROUTER (ENDPOINTS HTTP)
===============================================================================
Propósito:
    Define todos los endpoints HTTP del dominio de Lealtad. Cada endpoint
    delega la lógica de negocio a service.py y solo se encarga de:
    - Recibir y validar el request (vía schemas)
    - Verificar autorización del usuario
    - Llamar a la función correspondiente en service.py
    - Retornar la respuesta serializada

Qué DEBE ir aquí:
    - Definición de rutas con decoradores @router.get/post/put/delete
    - Inyección de dependencias (db, usuario_id)
    - Validación de autorización (validar_acceso_negocio)
    - Mapeo de schemas de request/response

Qué NO debe ir aquí:
    - Lógica de negocio (va en service.py)
    - Queries a la BD (van en service.py)
    - Definiciones de tablas (van en models.py)

Dependencias de otros archivos del dominio:
    - service.py contiene la lógica de negocio
    - schemas.py define los DTOs de entrada/salida
    - auth/router.py provee obtener_id_desde_token

Endpoints disponibles:
    Dashboard:
        GET  /negocios/{id}/dashboard
    Ofertas:
        POST   /negocios/{id}/ofertas
        PUT    /ofertas/{id}
        DELETE /ofertas/{id}
    Publicaciones:
        POST   /negocios/{id}/publicaciones
        PUT    /publicaciones/{id}
        DELETE /publicaciones/{id}
    Comentarios:
        POST   /comentarios
        GET    /publicaciones/{id}/comentarios
        GET    /ofertas/{id}/comentarios
        DELETE /comentarios/{id}
    Configuración:
        GET    /negocios/{id}/configuracion-lealtad
        PUT    /negocios/{id}/configuracion-lealtad
    QR:
        GET  /ofertas/{id}/generar-token-qr
        POST /ofertas/canjear-qr
===============================================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import get_db
from backend.auth.router import obtener_id_desde_token
from backend.lealtad import schemas, service

router = APIRouter(
    prefix="/api/lealtad",
    tags=["Lealtad"]
)


# ==========================================
# DASHBOARD
# ==========================================

@router.get("/negocios/{id_negocio}/dashboard", response_model=schemas.DashboardLealtadResponse)
def obtener_dashboard(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve métricas consolidadas, ofertas (con reglas NxN) y publicaciones."""
    return service.obtener_dashboard_negocio(db, id_negocio)


# ==========================================
# CATÁLOGO DISPONIBLE PARA OFERTAS
# ==========================================

@router.get("/negocios/{id_negocio}/catalogo-disponible", response_model=List[schemas.ServicioDisponibleLealtadResponse])
def obtener_catalogo_disponible(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve todos los productos y servicios disponibles del negocio para usar en reglas de ofertas."""
    return service.obtener_catalogo_disponible_negocio(db, id_negocio)


@router.get("/negocios/{id_negocio}/consumidores-afiliados")
def obtener_consumidores_afiliados(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve todos los consumidores afiliados al negocio (con cartera de lealtad), ordenados alfabéticamente."""
    return service.obtener_consumidores_afiliados(db, id_negocio)


@router.get("/negocios/{id_negocio}/sucursales")
def obtener_sucursales_negocio(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve todas las sucursales del negocio para el selector de ofertas."""
    return service.obtener_sucursales_negocio(db, id_negocio)


@router.get("/negocios/{id_negocio}/catalogo-productos-estrella")
def obtener_catalogo_productos_estrella(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Devuelve productos y servicios únicos del negocio para seleccionar como producto estrella."""
    service.validar_acceso_negocio(db, id_negocio, usuario_id)
    return service.obtener_catalogo_productos_estrella(db, id_negocio)


# ==========================================
# OFERTAS (Motor NxN)
# ==========================================

@router.post("/negocios/{id_negocio}/ofertas", status_code=status.HTTP_201_CREATED)
def crear_oferta(
    id_negocio: int,
    oferta: schemas.OfertaCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Crea una oferta con sus reglas NxN (requisitos + recompensas) y whitelist opcional."""
    service.validar_acceso_negocio(db, id_negocio, usuario_id)
    try:
        return service.crear_oferta_negocio(db, id_negocio, oferta)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/ofertas/{id_oferta}")
def actualizar_oferta(
    id_oferta: int,
    datos: schemas.OfertaUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Actualiza textos o estado (activa/pausada/finalizada) de una oferta."""
    return service.actualizar_oferta(db, id_oferta, datos)


@router.delete("/ofertas/{id_oferta}")
def eliminar_oferta(
    id_oferta: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Elimina permanentemente una oferta solo si no tiene canjes registrados."""
    return service.eliminar_oferta(db, id_oferta)


# ==========================================
# PUBLICACIONES
# ==========================================

@router.post("/negocios/{id_negocio}/publicaciones", status_code=status.HTTP_201_CREATED)
def crear_publicacion(
    id_negocio: int,
    publicacion: schemas.PublicacionCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Publica un anuncio en el feed del negocio, opcionalmente vinculado a una oferta."""
    service.validar_acceso_negocio(db, id_negocio, usuario_id)
    return service.crear_publicacion_negocio(db, id_negocio, publicacion)


@router.put("/publicaciones/{id_publicacion}")
def actualizar_publicacion(
    id_publicacion: int,
    datos: schemas.PublicacionUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Actualiza textos o permisos de comentarios de una publicación."""
    return service.actualizar_publicacion(db, id_publicacion, datos)


@router.delete("/publicaciones/{id_publicacion}")
def eliminar_publicacion(
    id_publicacion: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Elimina permanentemente una publicación del feed."""
    return service.eliminar_publicacion(db, id_publicacion)


# ==========================================
# COMENTARIOS (Arco Exclusivo)
# ==========================================

@router.post("/comentarios", status_code=status.HTTP_201_CREATED, response_model=schemas.ComentarioResponse)
def crear_comentario(
    datos: schemas.ComentarioCreate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Crea un comentario en una publicación o en una oferta (arco exclusivo)."""
    try:
        return service.crear_comentario(db, datos, usuario_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/publicaciones/{id_publicacion}/comentarios", response_model=List[schemas.ComentarioResponse])
def obtener_comentarios_publicacion(
    id_publicacion: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Lista todos los comentarios visibles de una publicación."""
    return service.obtener_comentarios_publicacion(db, id_publicacion)


@router.get("/ofertas/{id_oferta}/comentarios", response_model=List[schemas.ComentarioResponse])
def obtener_comentarios_oferta(
    id_oferta: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Lista todos los comentarios visibles de una oferta."""
    return service.obtener_comentarios_oferta(db, id_oferta)


@router.delete("/comentarios/{id_comentario}")
def ocultar_comentario(
    id_comentario: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Oculta un comentario del feed (soft delete) sin borrarlo de la BD."""
    service.ocultar_comentario(db, id_comentario)
    return {"mensaje": "Comentario ocultado correctamente."}


# ==========================================
# CONFIGURACIÓN DE LEALTAD
# ==========================================

@router.get("/negocios/{id_negocio}/configuracion-lealtad", response_model=schemas.ConfiguracionLealtadResponse)
def obtener_configuracion_lealtad(
    id_negocio: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Obtiene las reglas del programa de lealtad del negocio (puntos por peso, visitas, etc)."""
    service.validar_acceso_negocio(db, id_negocio, usuario_id)
    return service.obtener_configuracion_lealtad(db, id_negocio)


@router.put("/negocios/{id_negocio}/configuracion-lealtad", response_model=schemas.ConfiguracionLealtadResponse)
def actualizar_configuracion_lealtad(
    id_negocio: int,
    datos: schemas.ConfiguracionLealtadUpdate,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Actualiza las reglas del programa de lealtad del negocio."""
    service.validar_acceso_negocio(db, id_negocio, usuario_id)
    return service.actualizar_configuracion_lealtad(db, id_negocio, datos)


# ==========================================
# MOTOR DEL CÓDIGO QR Y CANJES
# ==========================================

@router.get("/ofertas/{id_oferta}/generar-token-qr", response_model=schemas.QRTokenResponse)
def generar_token_qr(
    id_oferta: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """Genera un token JWT de corta duración para renderizar un código QR de canje."""
    return service.generar_token_qr_logic(db, id_oferta, usuario_id)


@router.post("/ofertas/canjear-qr", response_model=schemas.CanjeResponse)
def canjear_qr(
    request: schemas.CanjearQRRequest,
    db: Session = Depends(get_db),
    empleado_id: int = Depends(obtener_id_desde_token)
):
    """Desencripta el QR, audita los límites y efectúa la redención en el POS."""
    return service.canjear_qr_logic(db, request, empleado_id)
