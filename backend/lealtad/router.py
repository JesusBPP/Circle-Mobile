from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional, List

from backend.core.database import get_db
from backend.auth.router import obtener_id_desde_token
from backend.lealtad import models as lealtad_models
from backend.negocios import models as negocios_models
from backend.finanzas import models as finanzas_models

router = APIRouter(
    prefix="/api/lealtad",
    tags=["Lealtad"]
)

# Configuración de Seguridad Interna para QR Tokens (Corta duración)
QR_SECRET_KEY = "circle_qr_token_secure_key_enterprise_grade_2026"
ALGORITHM = "HS256"
QR_EXPIRATION_MINUTES = 3

# ==========================================
# MODELOS PYDANTIC (LOCAL SCHEMAS)
# ==========================================
class QRTokenResponse(BaseModel):
    token_qr: str
    expira_en_segundos: int

class CanjearQRRequest(BaseModel):
    token_qr: str
    id_transaccion: int

class CanjeResponse(BaseModel):
    mensaje: str
    id_uso: int
    titulo_oferta: str
    descuento_aplicado: str


# ==========================================
# ENDPOINTS LOGÍSTICA QR
# ==========================================

@router.get("/ofertas/{id_oferta}/generar-token-qr", response_model=QRTokenResponse)
def generar_token_qr(
    id_oferta: int,
    db: Session = Depends(get_db),
    usuario_id: int = Depends(obtener_id_desde_token)
):
    """
    Genera un token JWT altamente seguro y firmado por el servidor de corta duración (3 minutos)
    para ser renderizado como código QR en la aplicación del consumidor.
    """
    # 1. Validar que la oferta exista
    oferta = db.query(lealtad_models.Oferta).filter(lealtad_models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta promocional no existe.")

    # 2. Validar vigencia de fechas
    ahora = datetime.utcnow()
    if oferta.fecha_inicio and ahora < oferta.fecha_inicio:
        raise HTTPException(status_code=400, detail="Esta promoción aún no comienza.")
    if oferta.fecha_fin and ahora > oferta.fecha_fin:
        raise HTTPException(status_code=400, detail="Esta promoción ya ha expirado.")

    # 3. Validar existencias si tiene límite
    if oferta.limite_existencias is not None and oferta.limite_existencias <= 0:
        raise HTTPException(status_code=400, detail="Esta promoción se ha agotado.")

    # 4. Validar Whitelist si no es pública
    if not oferta.es_publica:
        en_lista = db.query(lealtad_models.OfertaWhitelist).filter(
            lealtad_models.OfertaWhitelist.id_oferta == id_oferta,
            lealtad_models.OfertaWhitelist.id_usuario_consumidor == usuario_id
        ).first()
        if not en_lista:
            raise HTTPException(status_code=403, detail="No tienes acceso exclusivo a esta promoción VIP.")

    # 5. Validar límite por usuario si aplica
    if oferta.limite_por_usuario:
        usos = db.query(lealtad_models.HistorialUsoOferta).filter(
            lealtad_models.HistorialUsoOferta.id_oferta == id_oferta,
            lealtad_models.HistorialUsoOferta.id_usuario_consumidor == usuario_id
        ).count()
        if usos >= oferta.limite_por_usuario:
            raise HTTPException(status_code=400, detail="Has alcanzado el límite máximo de usos permitido para esta oferta.")

    # 6. Validar si el usuario cuenta con los puntos necesarios en caso de ser una recompensa canjeable
    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id == oferta.id_sucursales).first()
        if not sucursal:
            raise HTTPException(status_code=404, detail="Sucursal de la oferta no encontrada.")
        
        cartera = db.query(lealtad_models.CarteraLealtad).filter(
            lealtad_models.CarteraLealtad.id_usuario_consumidor == usuario_id,
            lealtad_models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(status_code=400, detail=f"Saldo de puntos insuficiente. Requieres {oferta.costo_en_puntos} puntos.")

    # 7. Crear el Payload del JWT firmado
    expiracion = datetime.utcnow() + timedelta(minutes=QR_EXPIRATION_MINUTES)
    payload = {
        "id_usuario_consumidor": usuario_id,
        "id_oferta": id_oferta,
        "exp": expiracion
    }
    
    token_jwt = jwt.encode(payload, QR_SECRET_KEY, algorithm=ALGORITHM)

    return QRTokenResponse(
        token_qr=token_jwt,
        expira_en_segundos=QR_EXPIRATION_MINUTES * 60
    )


@router.post("/ofertas/canjear-qr", response_model=CanjeResponse)
def canjear_qr(
    request: CanjearQRRequest,
    db: Session = Depends(get_db),
    empleado_id: int = Depends(obtener_id_desde_token)
):
    """
    Endpoint utilizado por la tablet/celular del negocio. Desencripta el QR,
    audita los límites y efectúa la redención ligándola a una transacción de caja.
    """
    # 1. Desencriptar y validar firma y expiración del QR
    try:
        payload = jwt.decode(request.token_qr, QR_SECRET_KEY, algorithms=[ALGORITHM])
        id_consumidor = payload.get("id_usuario_consumidor")
        id_oferta = payload.get("id_oferta")
    except JWTError:
        raise HTTPException(status_code=400, detail="El código QR es inválido, fue alterado o ya expiró. Pide al cliente generar uno nuevo.")

    # 2. Validar Transacción existente
    transaccion = db.query(finanzas_models.Transaccion).filter(finanzas_models.Transaccion.id == request.id_transaccion).first()
    if not transaccion:
        raise HTTPException(status_code=404, detail="La transacción financiera especificada no existe en caja.")

    # 3. Validar la Oferta
    oferta = db.query(lealtad_models.Oferta).filter(lealtad_models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta ligada a este QR ya no existe en el catálogo.")

    if oferta.limite_existencias is not None and oferta.limite_existencias <= 0:
        raise HTTPException(status_code=400, detail="Esta promoción se ha agotado por completo en inventario.")

    # 4. Evitar doble canje en el historial
    ya_canjeado = db.query(lealtad_models.HistorialUsoOferta).filter(
        lealtad_models.HistorialUsoOferta.id_oferta == id_oferta,
        lealtad_models.HistorialUsoOferta.id_transaccion == request.id_transaccion
    ).first()
    if ya_canjeado:
        raise HTTPException(status_code=400, detail="Este beneficio ya fue aplicado y procesado para esta transacción.")

    # 5. Si la oferta cuesta puntos, deducirlos de la Cartera Lealtad del Consumidor
    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id == oferta.id_sucursales).first()
        cartera = db.query(lealtad_models.CarteraLealtad).filter(
            lealtad_models.CarteraLealtad.id_usuario_consumidor == id_consumidor,
            lealtad_models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(status_code=400, detail="El cliente ya no cuenta con el saldo de puntos suficiente para este canje.")

        # Deducir puntos e insertar movimiento de auditoría
        cartera.saldo_puntos -= oferta.costo_en_puntos
        cartera.fecha_ultima_acumulacion = datetime.utcnow()
        
        movimiento = lealtad_models.HistorialMovimientoLealtad(
            id_cartera=cartera.id,
            id_transaccion=transaccion.id,
            tipo_movimiento="canje",
            monto_puntos=oferta.costo_en_puntos,
            monto_sellos=0,
            descripcion=f"Canje de recompensa via QR: {oferta.titulo}",
            fecha_movimiento=datetime.utcnow()
        )
        db.add(movimiento)

    # 6. Descontar stock global de la oferta si aplica
    if oferta.limite_existencias is not None:
        oferta.limite_existencias -= 1

    # 7. Registrar en el Historial de Usos
    nuevo_uso = lealtad_models.HistorialUsoOferta(
        id_oferta=id_oferta,
        id_usuario_consumidor=id_consumidor,
        id_transaccion=transaccion.id,
        fecha_uso=datetime.utcnow()
    )
    db.add(nuevo_uso)
    db.commit()

    return CanjeResponse(
        mensaje="Beneficio aplicado con éxito.",
        id_uso=nuevo_uso.id,
        titulo_oferta=oferta.titulo,
        descuento_aplicado="Verifica el ticket de la transacción para el desglose."
    )