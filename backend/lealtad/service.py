from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta

from backend.lealtad import models, schemas
from backend.negocios import models as negocios_models
from backend.finanzas import models as finanzas_models

QR_SECRET_KEY = "circle_qr_token_secure_key_enterprise_grade_2026"
ALGORITHM = "HS256"
QR_EXPIRATION_MINUTES = 3

# ==========================================
# DASHBOARD Y CREACIÓN
# ==========================================

def obtener_dashboard_negocio(db: Session, id_negocio: int):
    sucursales = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id_negocio == id_negocio).all()
    if not sucursales:
        raise HTTPException(status_code=404, detail="El negocio no tiene sucursales registradas.")
    
    id_sucursales = [s.id for s in sucursales]

    resultado_global = db.query(
        func.avg(models.ResenaSucursal.puntuacion).label('promedio'),
        func.count(models.ResenaSucursal.id).label('total')
    ).filter(models.ResenaSucursal.id_sucursal.in_(id_sucursales)).first()

    calificacion_global = float(resultado_global.promedio) if resultado_global.promedio else 0.0
    total_resenas_globales = resultado_global.total if resultado_global.total else 0

    lista_sucursales = [
        schemas.MetricasSucursal(
            id=suc.id,
            nombre=suc.nombre,
            calificacion=float(suc.calificacion_promedio) if suc.calificacion_promedio else 0.0,
            total_resenas=suc.total_resenas if suc.total_resenas else 0
        ) for suc in sucursales
    ]

    ofertas_db = db.query(models.Oferta).filter(models.Oferta.id_sucursales.in_(id_sucursales)).all()
    publicaciones_db = db.query(models.Publicacion).filter(models.Publicacion.id_negocio == id_negocio).all()

    feed_items = []
    for of in ofertas_db:
        feed_items.append({
            "id": f"o-{of.id}",
            "id_real": of.id,
            "type": "oferta",
            "titulo": of.titulo,
            "descripcion": of.descripcion,
            "estado": of.estado,
            "es_publica": of.es_publica,
            "costo_en_puntos": float(of.costo_en_puntos) if of.costo_en_puntos else None,
            "limite_existencias": of.limite_existencias,
            "fecha": of.fecha_inicio.strftime("%d %b %Y") if of.fecha_inicio else "Sin fecha"
        })

    for pub in publicaciones_db:
        feed_items.append({
            "id": f"p-{pub.id}",
            "id_real": pub.id,
            "type": "publicacion",
            "titulo": pub.titulo,
            "descripcion": pub.descripcion,
            "habilitar_comentarios": pub.habilitar_comentarios,
            "id_oferta": pub.id_oferta,
            "fecha": pub.fecha_publicacion.strftime("%d %b %Y")
        })

    return schemas.DashboardLealtadResponse(
        calificacion_global=round(calificacion_global, 1),
        total_resenas_globales=total_resenas_globales,
        sucursales=lista_sucursales,
        feed_items=sorted(feed_items, key=lambda x: x['id_real'], reverse=True)
    )

def crear_oferta_negocio(db: Session, id_negocio: int, oferta: schemas.OfertaCreate):
    sucursal_principal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id_negocio == id_negocio).first()
    if not sucursal_principal:
        raise HTTPException(status_code=400, detail="Debes registrar al menos una sucursal para crear ofertas.")

    nueva_oferta = models.Oferta(
        id_sucursales=sucursal_principal.id,
        titulo=oferta.titulo,
        descripcion=oferta.descripcion,
        fecha_inicio=oferta.fecha_inicio,
        fecha_fin=oferta.fecha_fin,
        costo_en_puntos=oferta.costo_en_puntos,
        limite_existencias=oferta.limite_existencias,
        limite_por_usuario=oferta.limite_por_usuario,
        es_publica=oferta.es_publica,
        estado="activa"
    )
    db.add(nueva_oferta)
    db.commit()
    db.refresh(nueva_oferta)

    if not oferta.es_publica and oferta.whitelist_ids:
        whitelist_records = [
            models.OfertaWhitelist(id_oferta=nueva_oferta.id, id_usuario_consumidor=uid) 
            for uid in oferta.whitelist_ids
        ]
        db.add_all(whitelist_records)
        db.commit()

    return nueva_oferta

def crear_publicacion_negocio(db: Session, id_negocio: int, publicacion: schemas.PublicacionCreate):
    nueva_pub = models.Publicacion(
        id_negocio=id_negocio,
        id_oferta=publicacion.id_oferta,
        titulo=publicacion.titulo,
        descripcion=publicacion.descripcion,
        url_imagen=publicacion.url_imagen,
        habilitar_comentarios=publicacion.habilitar_comentarios,
        fecha_publicacion=datetime.utcnow()
    )
    db.add(nueva_pub)
    db.commit()
    db.refresh(nueva_pub)
    return nueva_pub

# ==========================================
# 🌟 NUEVO: ACTUALIZAR Y ELIMINAR (FACADE PATTERN)
# ==========================================

def actualizar_oferta(db: Session, id_oferta: int, datos: schemas.OfertaUpdate):
    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")
    
    if datos.titulo is not None:
        oferta.titulo = datos.titulo
    if datos.descripcion is not None:
        oferta.descripcion = datos.descripcion
    if datos.estado is not None:
        oferta.estado = datos.estado

    db.commit()
    db.refresh(oferta)
    return oferta

def eliminar_oferta(db: Session, id_oferta: int):
    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")

    # Regla Enterprise: No borrar si ya se usó (Transaccionalidad)
    usos = db.query(models.HistorialUsoOferta).filter(models.HistorialUsoOferta.id_oferta == id_oferta).count()
    if usos > 0:
        raise HTTPException(
            status_code=400, 
            detail="No puedes eliminar una oferta que ya ha sido canjeada por clientes. Si deseas detenerla, cambia su estado a 'Inactiva'."
        )

    # Borrar dependencias seguras antes de borrar la oferta
    db.query(models.OfertaWhitelist).filter(models.OfertaWhitelist.id_oferta == id_oferta).delete()
    db.query(models.OfertaRegla).filter(models.OfertaRegla.id_oferta == id_oferta).delete()
    
    # Manejar comentarios en Arco Exclusivo (Desvincularlos o borrarlos)
    db.query(models.Comentario).filter(models.Comentario.id_oferta == id_oferta).delete()

    db.delete(oferta)
    db.commit()
    return {"mensaje": "Oferta eliminada correctamente."}

def actualizar_publicacion(db: Session, id_publicacion: int, datos: schemas.PublicacionUpdate):
    pub = db.query(models.Publicacion).filter(models.Publicacion.id == id_publicacion).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada.")
    
    if datos.titulo is not None:
        pub.titulo = datos.titulo
    if datos.descripcion is not None:
        pub.descripcion = datos.descripcion
    if datos.habilitar_comentarios is not None:
        pub.habilitar_comentarios = datos.habilitar_comentarios

    db.commit()
    db.refresh(pub)
    return pub

def eliminar_publicacion(db: Session, id_publicacion: int):
    pub = db.query(models.Publicacion).filter(models.Publicacion.id == id_publicacion).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada.")

    # Borrar comentarios vinculados
    db.query(models.Comentario).filter(models.Comentario.id_publicacion == id_publicacion).delete()

    db.delete(pub)
    db.commit()
    return {"mensaje": "Publicación eliminada correctamente."}


# ==========================================
# MOTOR DEL CÓDIGO QR Y CANJES
# ==========================================

def generar_token_qr_logic(db: Session, id_oferta: int, usuario_id: int):
    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta promocional no existe.")

    ahora = datetime.utcnow()
    if oferta.fecha_inicio and ahora < oferta.fecha_inicio:
        raise HTTPException(status_code=400, detail="Esta promoción aún no comienza.")
    if oferta.fecha_fin and ahora > oferta.fecha_fin:
        raise HTTPException(status_code=400, detail="Esta promoción ya ha expirado.")

    if oferta.limite_existencias is not None and oferta.limite_existencias <= 0:
        raise HTTPException(status_code=400, detail="Esta promoción se ha agotado.")

    if not oferta.es_publica:
        en_lista = db.query(models.OfertaWhitelist).filter(
            models.OfertaWhitelist.id_oferta == id_oferta,
            models.OfertaWhitelist.id_usuario_consumidor == usuario_id
        ).first()
        if not en_lista:
            raise HTTPException(status_code=403, detail="No tienes acceso exclusivo a esta promoción VIP.")

    if oferta.limite_por_usuario:
        usos = db.query(models.HistorialUsoOferta).filter(
            models.HistorialUsoOferta.id_oferta == id_oferta,
            models.HistorialUsoOferta.id_usuario_consumidor == usuario_id
        ).count()
        if usos >= oferta.limite_por_usuario:
            raise HTTPException(status_code=400, detail="Has alcanzado el límite máximo de usos permitido para esta oferta.")

    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id == oferta.id_sucursales).first()
        if not sucursal:
            raise HTTPException(status_code=404, detail="Sucursal de la oferta no encontrada.")
        
        cartera = db.query(models.CarteraLealtad).filter(
            models.CarteraLealtad.id_usuario_consumidor == usuario_id,
            models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(status_code=400, detail=f"Saldo insuficiente. Requieres {oferta.costo_en_puntos} puntos.")

    expiracion = datetime.utcnow() + timedelta(minutes=QR_EXPIRATION_MINUTES)
    payload = {
        "id_usuario_consumidor": usuario_id,
        "id_oferta": id_oferta,
        "exp": expiracion
    }
    
    token_jwt = jwt.encode(payload, QR_SECRET_KEY, algorithm=ALGORITHM)

    return schemas.QRTokenResponse(
        token_qr=token_jwt,
        expira_en_segundos=QR_EXPIRATION_MINUTES * 60
    )

def canjear_qr_logic(db: Session, request: schemas.CanjearQRRequest, empleado_id: int):
    try:
        payload = jwt.decode(request.token_qr, QR_SECRET_KEY, algorithms=[ALGORITHM])
        id_consumidor = payload.get("id_usuario_consumidor")
        id_oferta = payload.get("id_oferta")
    except JWTError:
        raise HTTPException(status_code=400, detail="El código QR es inválido o expiró. Pide al cliente generar uno nuevo.")

    transaccion = db.query(finanzas_models.Transaccion).filter(finanzas_models.Transaccion.id == request.id_transaccion).first()
    if not transaccion:
        raise HTTPException(status_code=404, detail="La transacción financiera especificada no existe en caja.")

    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta ligada a este QR ya no existe.")

    if oferta.limite_existencias is not None and oferta.limite_existencias <= 0:
        raise HTTPException(status_code=400, detail="Esta promoción se ha agotado en inventario.")

    ya_canjeado = db.query(models.HistorialUsoOferta).filter(
        models.HistorialUsoOferta.id_oferta == id_oferta,
        models.HistorialUsoOferta.id_transaccion == request.id_transaccion
    ).first()
    if ya_canjeado:
        raise HTTPException(status_code=400, detail="Este beneficio ya fue aplicado a esta transacción.")

    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(negocios_models.Sucursal.id == oferta.id_sucursales).first()
        cartera = db.query(models.CarteraLealtad).filter(
            models.CarteraLealtad.id_usuario_consumidor == id_consumidor,
            models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(status_code=400, detail="El cliente ya no cuenta con el saldo suficiente.")

        cartera.saldo_puntos -= oferta.costo_en_puntos
        cartera.fecha_ultima_acumulacion = datetime.utcnow()
        
        movimiento = models.HistorialMovimientoLealtad(
            id_cartera=cartera.id,
            id_transaccion=transaccion.id,
            tipo_movimiento="canje",
            monto_puntos=oferta.costo_en_puntos,
            monto_sellos=0,
            descripcion=f"Canje QR: {oferta.titulo}",
            fecha_movimiento=datetime.utcnow()
        )
        db.add(movimiento)

    if oferta.limite_existencias is not None:
        oferta.limite_existencias -= 1

    nuevo_uso = models.HistorialUsoOferta(
        id_oferta=id_oferta,
        id_usuario_consumidor=id_consumidor,
        id_transaccion=transaccion.id,
        fecha_uso=datetime.utcnow()
    )
    db.add(nuevo_uso)
    db.commit()

    return schemas.CanjeResponse(
        mensaje="Beneficio aplicado con éxito.",
        id_uso=nuevo_uso.id,
        titulo_oferta=oferta.titulo,
        descuento_aplicado="Verifica el ticket de la transacción."
    )