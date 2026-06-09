"""
===============================================================================
MÓDULO: LEALTAD — SERVICE (LÓGICA DE NEGOCIO)
===============================================================================
Propósito:
    Contiene toda la lógica de negocio del dominio de Lealtad. Actúa como
    intermediario entre router.py (HTTP) y models.py (BD). Cada función
    implementa una operación de negocio completa con validaciones y transacciones.

Qué DEBE ir aquí:
    - Lógica de creación/actualización/eliminación de ofertas, publicaciones, comentarios
    - Motor NxN: creación de reglas (requisitos + recompensas)
    - Validaciones de negocio (fechas, límites, arco exclusivo, autorización)
    - Queries complejas con agregaciones

Qué NO debe ir aquí:
    - Endpoints HTTP (van en router.py)
    - Definiciones de tablas (van en models.py)
    - Validaciones de entrada (van en schemas.py)
    - Configuración de secretos (van en config.py)

Dependencias de otros archivos del dominio:
    - router.py llama a las funciones de este archivo
    - models.py provee las clases SQLAlchemy
    - schemas.py provee los DTOs de entrada/salida
    - config.py provee QR_SECRET_KEY, ALGORITHM, QR_EXPIRATION_MINUTES

Funciones principales:
    - Dashboard: obtener_dashboard_negocio()
    - Ofertas: crear/actualizar/eliminar (con reglas NxN)
    - Publicaciones: crear/actualizar/eliminar
    - Comentarios: crear/obtener/ocultar (arco exclusivo)
    - Configuración: obtener/actualizar reglas de lealtad
    - QR: generar token / canjear
    - Autorización: validar_acceso_negocio()
===============================================================================
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta

from backend.lealtad import models, schemas
from backend.lealtad.config import QR_SECRET_KEY, ALGORITHM, QR_EXPIRATION_MINUTES
from backend.negocios import models as negocios_models
from backend.finanzas import models as finanzas_models
from backend.catalogo import models as catalogo_models


# ==========================================
# AUTORIZACIÓN
# ==========================================

def validar_acceso_negocio(db: Session, id_negocio: int, usuario_id: int):
    """
    Verifica que el usuario sea dueño o empleado del negocio.
    Lanza HTTPException 403 si no tiene acceso.
    """
    negocio = db.query(negocios_models.Negocio).filter(
        negocios_models.Negocio.id == id_negocio
    ).first()

    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado.")

    if negocio.id_dueno == usuario_id:
        return

    es_empleado = db.query(negocios_models.EmpleadoSucursal).join(
        negocios_models.Sucursal,
        negocios_models.EmpleadoSucursal.id_sucursal == negocios_models.Sucursal.id
    ).filter(
        negocios_models.Sucursal.id_negocio == id_negocio,
        negocios_models.EmpleadoSucursal.id_usuario == usuario_id,
        negocios_models.EmpleadoSucursal.estado_invitacion == "aceptada"
    ).first()

    if not es_empleado:
        raise HTTPException(
            status_code=403,
            detail="No tienes acceso a este negocio. Solo el dueño o empleados autorizados pueden realizar esta acción."
        )


# ==========================================
# CATÁLOGO DISPONIBLE PARA OFERTAS
# ==========================================

def obtener_catalogo_disponible_negocio(db: Session, id_negocio: int):
    """
    Devuelve todos los productos y servicios disponibles del negocio
    para usar en las reglas de ofertas (Motor NxN).
    A diferencia del endpoint de Agenda, este retorna tanto productos como servicios.
    """
    sucursales = db.query(negocios_models.Sucursal.id).filter(
        negocios_models.Sucursal.id_negocio == id_negocio
    ).all()
    
    if not sucursales:
        return []
    
    ids_sucursales = [s[0] for s in sucursales]
    
    disponibles = db.query(catalogo_models.ServicioDisponible).filter(
        catalogo_models.ServicioDisponible.id_sucursal.in_(ids_sucursales)
    ).all()
    
    ids_productos = list(set([d.id_servicio_producto for d in disponibles]))
    
    productos = db.query(catalogo_models.ServicioProducto).filter(
        catalogo_models.ServicioProducto.id.in_(ids_productos)
    ).all()
    
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "costo": float(p.costo),
            "tipo_producto": p.tipo_producto
        }
        for p in productos
    ]


def obtener_consumidores_afiliados(db: Session, id_negocio: int):
    """
    Devuelve todos los consumidores afiliados al negocio (con cartera de lealtad),
    ordenados alfabéticamente por nombre.
    """
    from backend.usuarios import models as usuarios_models
    
    carteras = db.query(models.CarteraLealtad).filter(
        models.CarteraLealtad.id_negocio == id_negocio
    ).all()
    
    if not carteras:
        return []
    
    ids_consumidores = [c.id_usuario_consumidor for c in carteras]
    
    consumidores = db.query(usuarios_models.Usuario).filter(
        usuarios_models.Usuario.id.in_(ids_consumidores)
    ).order_by(usuarios_models.Usuario.nombre).all()
    
    return [
        {
            "id": u.id,
            "nombre": u.nombre,
            "correo": u.correo
        }
        for u in consumidores
    ]


def obtener_sucursales_negocio(db: Session, id_negocio: int):
    """Devuelve todas las sucursales del negocio para el selector de ofertas."""
    sucursales = db.query(negocios_models.Sucursal).filter(
        negocios_models.Sucursal.id_negocio == id_negocio
    ).order_by(negocios_models.Sucursal.nombre).all()
    
    return [
        {
            "id": s.id,
            "nombre": s.nombre,
            "ciudad": s.ciudad,
            "estado": s.estado
        }
        for s in sucursales
    ]


# ==========================================
# OFERTAS (Motor NxN)
# ==========================================

def verificar_y_pausar_ofertas_agotadas(db: Session, id_negocio: int):
    """
    Verifica todas las ofertas activas del negocio y pausa automáticamente
    aquellas que han agotado su stock.
    
    Patrón: Observer - Reacciona al estado del sistema (stock = 0)
    """
    # Obtener sucursales del negocio
    sucursales = db.query(negocios_models.Sucursal).filter(
        negocios_models.Sucursal.id_negocio == id_negocio
    ).all()
    
    if not sucursales:
        return []
    
    id_sucursales = [s.id for s in sucursales]
    
    # Obtener todas las ofertas activas con límite de existencias
    ofertas_activas = db.query(models.Oferta).filter(
        models.Oferta.id_sucursales.in_(id_sucursales),
        models.Oferta.estado == 'activa',
        models.Oferta.limite_existencias.isnot(None)
    ).all()
    
    ofertas_pausadas = []
    
    for oferta in ofertas_activas:
        # Contar canjes existentes
        total_canjes = db.query(func.count(models.HistorialUsoOferta.id)).filter(
            models.HistorialUsoOferta.id_oferta == oferta.id
        ).scalar() or 0
        
        # Si stock agotado, pausar automáticamente
        if total_canjes >= oferta.limite_existencias:
            oferta.estado = 'pausada'
            ofertas_pausadas.append(oferta.titulo)
    
    # Commit si hay cambios
    if ofertas_pausadas:
        db.commit()
    
    return ofertas_pausadas


def obtener_dashboard_negocio(db: Session, id_negocio: int):
    """
    Devuelve métricas consolidadas, ofertas (con reglas NxN) y publicaciones
    para el SPA de Lealtad.
    """
    # NUEVO: Verificar y pausar ofertas agotadas antes de retornar dashboard
    ofertas_pausadas = verificar_y_pausar_ofertas_agotadas(db, id_negocio)
    
    sucursales = db.query(negocios_models.Sucursal).filter(
        negocios_models.Sucursal.id_negocio == id_negocio
    ).all()

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

    ofertas_db = db.query(models.Oferta).filter(
        models.Oferta.id_sucursales.in_(id_sucursales)
    ).all()

    publicaciones_db = db.query(models.Publicacion).filter(
        models.Publicacion.id_negocio == id_negocio
    ).all()

    feed_items = []

    for of in ofertas_db:
        reglas_lista = db.query(models.OfertaRegla).filter(
            models.OfertaRegla.id_oferta == of.id
        ).all()

        reglas_serializadas = []
        for r in reglas_lista:
            nombre_servicio = None
            tipo_servicio = None
            if r.id_servicio_disponible:
                disponible = db.query(catalogo_models.ServicioDisponible).filter(
                    catalogo_models.ServicioDisponible.id == r.id_servicio_disponible
                ).first()
                if disponible:
                    producto = db.query(catalogo_models.ServicioProducto).filter(
                        catalogo_models.ServicioProducto.id == disponible.id_servicio_producto
                    ).first()
                    if producto:
                        nombre_servicio = producto.nombre
                        tipo_servicio = producto.tipo_producto

            reglas_serializadas.append({
                "id": r.id,
                "tipo_regla": r.tipo_regla,
                "id_servicio_disponible": r.id_servicio_disponible,
                "nombre_servicio_disponible": nombre_servicio,
                "tipo_servicio_disponible": tipo_servicio,
                "cantidad": r.cantidad,
                "porcentaje_descuento": float(r.porcentaje_descuento) if r.porcentaje_descuento else None,
                "monto_descuento": float(r.monto_descuento) if r.monto_descuento else None,
                "monto_minimo": float(r.monto_minimo) if r.monto_minimo else None,
            })

        # NUEVO: Obtener nombre de sucursal
        sucursal = db.query(negocios_models.Sucursal).filter(
            negocios_models.Sucursal.id == of.id_sucursales
        ).first()
        nombre_sucursal = sucursal.nombre if sucursal else "Desconocida"

        # NUEVO: Contar canjes existentes
        total_canjes = db.query(func.count(models.HistorialUsoOferta.id)).filter(
            models.HistorialUsoOferta.id_oferta == of.id
        ).scalar() or 0

        # NUEVO: Calcular stock restante
        stock_restante = None
        if of.limite_existencias is not None:
            stock_restante = of.limite_existencias - total_canjes

        feed_items.append({
            "id": f"o-{of.id}",
            "id_real": of.id,
            "type": "oferta",
            "id_sucursales": of.id_sucursales,
            "nombre_sucursal": nombre_sucursal,
            "titulo": of.titulo,
            "descripcion": of.descripcion,
            "estado": of.estado,
            "es_publica": of.es_publica,
            "costo_en_puntos": float(of.costo_en_puntos) if of.costo_en_puntos else None,
            "limite_existencias": of.limite_existencias,
            "limite_por_usuario": of.limite_por_usuario,
            "fecha_inicio": of.fecha_inicio.isoformat() if of.fecha_inicio else None,
            "fecha_fin": of.fecha_fin.isoformat() if of.fecha_fin else None,
            "fecha": of.fecha_inicio.strftime("%d %b %Y") if of.fecha_inicio else "Sin fecha",
            "total_canjes": total_canjes,
            "stock_restante": stock_restante,
            "reglas": reglas_serializadas
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


# ==========================================
# OFERTAS (Motor NxN)
# ==========================================

def crear_oferta_negocio(db: Session, id_negocio: int, oferta: schemas.OfertaCreate):
    """
    Crea una oferta con sus reglas NxN (requisitos + recompensas) y whitelist opcional.
    Si id_sucursales es None o vacío, replica la oferta en TODAS las sucursales del negocio.
    Si tiene IDs específicos, valida que pertenezcan al negocio y crea una oferta por cada una.
    """
    sucursales_negocio = db.query(negocios_models.Sucursal).filter(
        negocios_models.Sucursal.id_negocio == id_negocio
    ).all()

    if not sucursales_negocio:
        raise HTTPException(
            status_code=400,
            detail="Debes registrar al menos una sucursal para crear ofertas."
        )

    ids_sucursales_negocio = {s.id for s in sucursales_negocio}

    if oferta.id_sucursales and len(oferta.id_sucursales) > 0:
        for sid in oferta.id_sucursales:
            if sid not in ids_sucursales_negocio:
                raise HTTPException(
                    status_code=400,
                    detail=f"La sucursal {sid} no pertenece a este negocio."
                )
        ids_objetivo = list(set(oferta.id_sucursales))
    else:
        ids_objetivo = list(ids_sucursales_negocio)

    try:
        ofertas_creadas = []
        for id_sucursal in ids_objetivo:
            nueva_oferta = models.Oferta(
                id_sucursales=id_sucursal,
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
            db.flush()

            if oferta.reglas:
                reglas_db = [
                    models.OfertaRegla(
                        id_oferta=nueva_oferta.id,
                        tipo_regla=regla.tipo_regla,
                        id_servicio_disponible=regla.id_servicio_disponible,
                        cantidad=regla.cantidad,
                        porcentaje_descuento=regla.porcentaje_descuento,
                        monto_descuento=regla.monto_descuento,
                        monto_minimo=regla.monto_minimo,
                    )
                    for regla in oferta.reglas
                ]
                db.add_all(reglas_db)

            if not oferta.es_publica and oferta.whitelist_ids:
                whitelist_records = [
                    models.OfertaWhitelist(
                        id_oferta=nueva_oferta.id,
                        id_usuario_consumidor=uid
                    )
                    for uid in oferta.whitelist_ids
                ]
                db.add_all(whitelist_records)

            ofertas_creadas.append(nueva_oferta)

        db.commit()
        for of in ofertas_creadas:
            db.refresh(of)
        return ofertas_creadas
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear la oferta en las sucursales seleccionadas: {str(e)}")


def actualizar_oferta(db: Session, id_oferta: int, datos: schemas.OfertaUpdate):
    """Actualiza textos o estado (activa/pausada/finalizada) de una oferta."""
    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")

    # NUEVO: Validar si intentan activar oferta sin stock
    if datos.estado == 'activa' and oferta.limite_existencias is not None:
        total_canjes = db.query(func.count(models.HistorialUsoOferta.id)).filter(
            models.HistorialUsoOferta.id_oferta == id_oferta
        ).scalar() or 0
        
        if total_canjes >= oferta.limite_existencias:
            raise HTTPException(
                status_code=400,
                detail="No puedes activar una oferta sin stock. Aumenta el límite de existencias primero."
            )

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
    """Elimina permanentemente una oferta solo si no tiene canjes registrados."""
    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada.")

    usos = db.query(models.HistorialUsoOferta).filter(
        models.HistorialUsoOferta.id_oferta == id_oferta
    ).count()

    if usos > 0:
        raise HTTPException(
            status_code=400,
            detail="No puedes eliminar una oferta que ya ha sido canjeada por clientes. Si deseas detenerla, cambia su estado a 'pausada'."
        )

    db.query(models.OfertaWhitelist).filter(models.OfertaWhitelist.id_oferta == id_oferta).delete()
    db.query(models.OfertaRegla).filter(models.OfertaRegla.id_oferta == id_oferta).delete()
    db.query(models.Comentario).filter(models.Comentario.id_oferta == id_oferta).delete()

    db.delete(oferta)
    db.commit()
    return {"mensaje": "Oferta eliminada correctamente."}


# ==========================================
# PUBLICACIONES
# ==========================================

def crear_publicacion_negocio(db: Session, id_negocio: int, publicacion: schemas.PublicacionCreate):
    """Publica un anuncio en el feed del negocio, opcionalmente vinculado a una oferta."""
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


def actualizar_publicacion(db: Session, id_publicacion: int, datos: schemas.PublicacionUpdate):
    """Actualiza textos o permisos de comentarios de una publicación."""
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
    """Elimina permanentemente una publicación del feed."""
    pub = db.query(models.Publicacion).filter(models.Publicacion.id == id_publicacion).first()
    if not pub:
        raise HTTPException(status_code=404, detail="Publicación no encontrada.")

    db.query(models.Comentario).filter(models.Comentario.id_publicacion == id_publicacion).delete()

    db.delete(pub)
    db.commit()
    return {"mensaje": "Publicación eliminada correctamente."}


# ==========================================
# COMENTARIOS (Arco Exclusivo)
# ==========================================

def obtener_comentarios_publicacion(db: Session, id_publicacion: int):
    """Lista todos los comentarios visibles de una publicación, ordenados por fecha DESC."""
    comentarios = db.query(models.Comentario).filter(
        models.Comentario.id_publicacion == id_publicacion,
        models.Comentario.esta_oculto == False
    ).order_by(models.Comentario.fecha_comentario.desc()).all()
    return comentarios


def obtener_comentarios_oferta(db: Session, id_oferta: int):
    """Lista todos los comentarios visibles de una oferta, ordenados por fecha DESC."""
    comentarios = db.query(models.Comentario).filter(
        models.Comentario.id_oferta == id_oferta,
        models.Comentario.esta_oculto == False
    ).order_by(models.Comentario.fecha_comentario.desc()).all()
    return comentarios


def crear_comentario(db: Session, datos: schemas.ComentarioCreate, id_usuario: int):
    """
    Crea un comentario con validación de arco exclusivo:
    debe apuntar a Publicación O a Oferta, nunca a ambos.
    """
    nuevo_comentario = models.Comentario(
        id_publicacion=datos.id_publicacion,
        id_oferta=datos.id_oferta,
        id_usuario_consumidor=id_usuario,
        texto_comentario=datos.texto_comentario,
        fecha_comentario=datetime.utcnow(),
        esta_oculto=False
    )
    db.add(nuevo_comentario)
    db.commit()
    db.refresh(nuevo_comentario)
    return nuevo_comentario


def ocultar_comentario(db: Session, id_comentario: int):
    """Soft delete: oculta un comentario del feed sin borrarlo de la BD."""
    comentario = db.query(models.Comentario).filter(
        models.Comentario.id == id_comentario
    ).first()

    if not comentario:
        raise HTTPException(status_code=404, detail="Comentario no encontrado.")

    comentario.esta_oculto = True
    db.commit()
    db.refresh(comentario)
    return comentario


# ==========================================
# CONFIGURACIÓN DE LEALTAD
# ==========================================

def obtener_configuracion_lealtad(db: Session, id_negocio: int):
    """
    Obtiene la configuración de lealtad del negocio.
    Si no existe, crea una con valores por defecto y la retorna.
    """
    config = db.query(models.ConfiguracionLealtad).filter(
        models.ConfiguracionLealtad.id_negocio == id_negocio
    ).first()

    if not config:
        config = models.ConfiguracionLealtad(
            id_negocio=id_negocio,
            tasa_puntos_por_peso=0.0,
            puntos_por_visita=0,
            multiplicador_producto=1.0,
            meses_vigencia_puntos=12
        )
        db.add(config)
        db.commit()
        db.refresh(config)

    return config


def actualizar_configuracion_lealtad(db: Session, id_negocio: int, datos: schemas.ConfiguracionLealtadUpdate):
    """Actualiza las reglas del programa de lealtad del negocio."""
    config = db.query(models.ConfiguracionLealtad).filter(
        models.ConfiguracionLealtad.id_negocio == id_negocio
    ).first()

    if not config:
        config = models.ConfiguracionLealtad(id_negocio=id_negocio)
        db.add(config)

    if datos.tasa_puntos_por_peso is not None:
        config.tasa_puntos_por_peso = datos.tasa_puntos_por_peso
    if datos.puntos_por_visita is not None:
        config.puntos_por_visita = datos.puntos_por_visita
    if datos.id_producto_estrella is not None:
        config.id_producto_estrella = datos.id_producto_estrella
    if datos.multiplicador_producto is not None:
        config.multiplicador_producto = datos.multiplicador_producto
    if datos.meses_vigencia_puntos is not None:
        config.meses_vigencia_puntos = datos.meses_vigencia_puntos

    db.commit()
    db.refresh(config)
    return config


# ==========================================
# MOTOR DEL CÓDIGO QR Y CANJES
# ==========================================

def generar_token_qr_logic(db: Session, id_oferta: int, usuario_id: int):
    """Genera un token JWT de corta duración para renderizar un código QR de canje."""
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
            raise HTTPException(
                status_code=400,
                detail="Has alcanzado el límite máximo de usos permitido para esta oferta."
            )

    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(
            negocios_models.Sucursal.id == oferta.id_sucursales
        ).first()
        if not sucursal:
            raise HTTPException(status_code=404, detail="Sucursal de la oferta no encontrada.")

        cartera = db.query(models.CarteraLealtad).filter(
            models.CarteraLealtad.id_usuario_consumidor == usuario_id,
            models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo insuficiente. Requieres {oferta.costo_en_puntos} puntos."
            )

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
    """Desencripta el QR, audita los límites y efectúa la redención en el POS."""
    try:
        payload = jwt.decode(request.token_qr, QR_SECRET_KEY, algorithms=[ALGORITHM])
        id_consumidor = payload.get("id_usuario_consumidor")
        id_oferta = payload.get("id_oferta")
    except JWTError:
        raise HTTPException(
            status_code=400,
            detail="El código QR es inválido o expiró. Pide al cliente generar uno nuevo."
        )

    transaccion = db.query(finanzas_models.Transaccion).filter(
        finanzas_models.Transaccion.id == request.id_transaccion
    ).first()
    if not transaccion:
        raise HTTPException(
            status_code=404,
            detail="La transacción financiera especificada no existe en caja."
        )

    oferta = db.query(models.Oferta).filter(models.Oferta.id == id_oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta ligada a este QR ya no existe.")

    # NUEVO: Validar stock antes de procesar canje
    if oferta.limite_existencias is not None:
        total_canjes = db.query(func.count(models.HistorialUsoOferta.id)).filter(
            models.HistorialUsoOferta.id_oferta == id_oferta
        ).scalar() or 0
        
        if total_canjes >= oferta.limite_existencias:
            # Auto-pausar oferta agotada
            oferta.estado = 'pausada'
            db.commit()
            raise HTTPException(
                status_code=400, 
                detail="Esta oferta ha agotado su stock disponible y se ha pausado automáticamente."
            )

    ya_canjeado = db.query(models.HistorialUsoOferta).filter(
        models.HistorialUsoOferta.id_oferta == id_oferta,
        models.HistorialUsoOferta.id_transaccion == request.id_transaccion
    ).first()
    if ya_canjeado:
        raise HTTPException(
            status_code=400,
            detail="Este beneficio ya fue aplicado a esta transacción."
        )

    if oferta.costo_en_puntos and oferta.costo_en_puntos > 0:
        sucursal = db.query(negocios_models.Sucursal).filter(
            negocios_models.Sucursal.id == oferta.id_sucursales
        ).first()
        cartera = db.query(models.CarteraLealtad).filter(
            models.CarteraLealtad.id_usuario_consumidor == id_consumidor,
            models.CarteraLealtad.id_negocio == sucursal.id_negocio
        ).first()

        if not cartera or cartera.saldo_puntos < oferta.costo_en_puntos:
            raise HTTPException(
                status_code=400,
                detail="El cliente ya no cuenta con el saldo suficiente."
            )

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
