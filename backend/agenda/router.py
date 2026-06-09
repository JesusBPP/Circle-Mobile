from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.core.database import get_db
from backend.agenda import models as agenda_models
from backend.agenda import schemas as agenda_schemas
from backend.negocios import models as negocios_models
from backend.catalogo import models as catalogo_models
from backend.usuarios import models as usuarios_models

router = APIRouter(
    prefix="/api/agenda",
    tags=["Agenda"]
)

# ==========================================
# 🌟 PATRONES DE DISEÑO: REPOSITORIO Y FACHADA
# ==========================================
def validar_empalme_citas(db: Session, id_sucursal: int, inicio: datetime, fin: datetime, exclude_cita_id: int = None):
    query = db.query(agenda_models.Cita).filter(
        agenda_models.Cita.id_sucursal == id_sucursal,
        agenda_models.Cita.estado.notin_(["Cancelada", "Finalizada"]),
        agenda_models.Cita.fecha_hora_inicio < fin,
        agenda_models.Cita.fecha_hora_fin > inicio
    )
    if exclude_cita_id:
        query = query.filter(agenda_models.Cita.id != exclude_cita_id)
        
    empalme = query.first()
    if empalme:
        raise HTTPException(status_code=400, detail=f"Horario no disponible. Se empalma con la actividad: {empalme.titulo}")

def formatear_cita_response(db: Session, cita: agenda_models.Cita):
    es_cita = db.query(agenda_models.CitaServicio).filter(agenda_models.CitaServicio.id_cita == cita.id).first()
    tipo = "cita" if es_cita else "evento"
    
    vinculos = db.query(agenda_models.CitaConsumidor).filter(agenda_models.CitaConsumidor.id_cita == cita.id).all()
    consumidores = []
    for v in vinculos:
        u = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.id == v.id_usuario_consumidor).first()
        if u:
            consumidores.append({"id": u.id, "nombre": u.nombre, "correo": u.correo})
    
    return {
        "id": cita.id,
        "id_sucursal": cita.id_sucursal,
        "titulo": cita.titulo,
        "descripcion": cita.descripcion,
        "fecha_hora_inicio": cita.fecha_hora_inicio,
        "fecha_hora_fin": cita.fecha_hora_fin,
        "numero_bloques": cita.numero_bloques,
        "notas_internas": cita.notas_internas,
        "estado": cita.estado,
        "tipo": tipo,
        "consumidores_vinculados": consumidores
    }

def buscar_usuarios_por_texto(db: Session, query: str):
    busqueda = f"%{query}%"
    return db.query(usuarios_models.Usuario).filter(
        (usuarios_models.Usuario.nombre.ilike(busqueda)) | 
        (usuarios_models.Usuario.correo.ilike(busqueda))
    ).limit(10).all()

# ==========================================
# ENDPOINTS BÁSICOS DE AGENDA
# ==========================================

@router.get("/negocios/{id_negocio}/servicios", response_model=List[agenda_schemas.ServicioDropdownResponse])
def obtener_servicios_dropdown(id_negocio: int, db: Session = Depends(get_db)):
    sucursales = db.query(negocios_models.Sucursal.id).filter(negocios_models.Sucursal.id_negocio == id_negocio).all()
    ids_suc = [s[0] for s in sucursales]
    
    disponibles = db.query(catalogo_models.ServicioDisponible).filter(catalogo_models.ServicioDisponible.id_sucursal.in_(ids_suc)).all()
    ids_prod = [d.id_servicio_producto for d in disponibles]
    
    servicios = db.query(catalogo_models.ServicioProducto).filter(
        catalogo_models.ServicioProducto.id.in_(ids_prod),
        catalogo_models.ServicioProducto.tipo_producto == 'servicio'
    ).all()
    
    return [{"id": s.id, "nombre": s.nombre, "costo": s.costo} for s in servicios]

@router.get("/negocios/{id_negocio}/citas", response_model=List[agenda_schemas.CitaResponse])
def obtener_citas_negocio(id_negocio: int, db: Session = Depends(get_db)):
    sucursales = db.query(negocios_models.Sucursal.id).filter(negocios_models.Sucursal.id_negocio == id_negocio).all()
    ids_sucursales = [suc[0] for suc in sucursales]
    if not ids_sucursales: return []
        
    citas = db.query(agenda_models.Cita).filter(agenda_models.Cita.id_sucursal.in_(ids_sucursales)).all()
    return [formatear_cita_response(db, c) for c in citas]

@router.post("/negocios/{id_negocio}/citas", response_model=agenda_schemas.CitaResponse, status_code=status.HTTP_201_CREATED)
def crear_cita(id_negocio: int, cita: agenda_schemas.CitaCreate, db: Session = Depends(get_db)):
    validar_empalme_citas(db, cita.id_sucursal, cita.fecha_hora_inicio, cita.fecha_hora_fin)
        
    datos_cita = cita.model_dump(exclude={"id_servicio_disponible", "id_usuario_consumidor"})
    nueva_cita = agenda_models.Cita(**datos_cita)
    db.add(nueva_cita)
    db.flush() 
    
    if cita.id_servicio_disponible:
        servicio_disp = db.query(catalogo_models.ServicioDisponible).filter(
            catalogo_models.ServicioDisponible.id == cita.id_servicio_disponible
        ).first()
        costo = servicio_disp.servicio_producto.costo if servicio_disp else 0
        db.add(agenda_models.CitaServicio(
            id_cita=nueva_cita.id,
            id_servicio_disponible=cita.id_servicio_disponible,
            costo_actual=costo
        ))
        
    if cita.id_usuario_consumidor:
        db.add(agenda_models.CitaConsumidor(id_cita=nueva_cita.id, id_usuario_consumidor=cita.id_usuario_consumidor))

    db.commit()
    db.refresh(nueva_cita)
    return formatear_cita_response(db, nueva_cita)

@router.get("/citas/{id_cita}", response_model=agenda_schemas.CitaResponse)
def obtener_cita(id_cita: int, db: Session = Depends(get_db)):
    cita = db.query(agenda_models.Cita).filter(agenda_models.Cita.id == id_cita).first()
    if not cita: raise HTTPException(status_code=404, detail="Cita no encontrada")
    return formatear_cita_response(db, cita)

@router.put("/citas/{id_cita}", response_model=agenda_schemas.CitaResponse)
def actualizar_cita(id_cita: int, cita_update: agenda_schemas.CitaUpdate, db: Session = Depends(get_db)):
    cita = db.query(agenda_models.Cita).filter(agenda_models.Cita.id == id_cita).first()
    if not cita: raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    fechas_modificadas = False
    if cita_update.fecha_hora_inicio and cita_update.fecha_hora_fin:
        if cita_update.fecha_hora_inicio != cita.fecha_hora_inicio or cita_update.fecha_hora_fin != cita.fecha_hora_fin:
            validar_empalme_citas(db, cita.id_sucursal, cita_update.fecha_hora_inicio, cita_update.fecha_hora_fin, exclude_cita_id=cita.id)
            cita.fecha_hora_inicio = cita_update.fecha_hora_inicio
            cita.fecha_hora_fin = cita_update.fecha_hora_fin
            fechas_modificadas = True

    transiciones_validas = {
        "Programada": ["Reprogramada", "Finalizada", "Cancelada"],
        "Reprogramada": ["Reprogramada", "Finalizada", "Cancelada"],
        "Pendiente": ["Programada", "Finalizada", "Cancelada"],
        "Finalizada": [], "Cancelada": []
    }

    if cita_update.estado and cita_update.estado != cita.estado:
        if cita_update.estado not in transiciones_validas.get(cita.estado, []):
            raise HTTPException(status_code=400, detail=f"Transición inválida de {cita.estado} a {cita_update.estado}.")
        cita.estado = cita_update.estado
    elif fechas_modificadas and cita.estado == "Programada":
        cita.estado = "Reprogramada"

    if cita_update.descripcion is not None: cita.descripcion = cita_update.descripcion
    if cita_update.notas_internas is not None: cita.notas_internas = cita_update.notas_internas
        
    db.commit()
    db.refresh(cita)
    return formatear_cita_response(db, cita)

# ==========================================
# 🌟 ENDPOINTS DEL CRM (BUSCAR Y VINCULAR)
# ==========================================

@router.get("/negocios/{id_negocio}/consumidores/buscar", response_model=List[agenda_schemas.ConsumidorBusqueda])
def buscar_consumidor_global(id_negocio: int, q: str, db: Session = Depends(get_db)):
    if len(q) < 3: return []
    usuarios = buscar_usuarios_por_texto(db, q)
    return [{"id": u.id, "nombre": u.nombre, "correo": u.correo} for u in usuarios]

@router.post("/citas/{id_cita}/consumidores")
def vincular_consumidor_a_cita(id_cita: int, request: agenda_schemas.VincularConsumidorRequest, db: Session = Depends(get_db)):
    cita = db.query(agenda_models.Cita).filter(agenda_models.Cita.id == id_cita).first()
    if not cita: raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    existe = db.query(agenda_models.CitaConsumidor).filter(
        agenda_models.CitaConsumidor.id_cita == id_cita,
        agenda_models.CitaConsumidor.id_usuario_consumidor == request.id_usuario_consumidor
    ).first()
    
    if existe: raise HTTPException(status_code=400, detail="Este usuario ya está en la cita.")
        
    db.add(agenda_models.CitaConsumidor(id_cita=id_cita, id_usuario_consumidor=request.id_usuario_consumidor))
    db.commit()
    return {"mensaje": "Cliente vinculado exitosamente"}

@router.get("/negocios/{id_negocio}/consumidores/{id_consumidor}/historial", response_model=agenda_schemas.ConsumidorHistorialResponse)
def obtener_historial_consumidor(id_negocio: int, id_consumidor: int, db: Session = Depends(get_db)):
    usuario = db.query(usuarios_models.Usuario).filter(usuarios_models.Usuario.id == id_consumidor).first()
    if not usuario: raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    sucursales = db.query(negocios_models.Sucursal.id).filter(negocios_models.Sucursal.id_negocio == id_negocio).all()
    ids_sucursales = [s[0] for s in sucursales]
    
    vinculos = db.query(agenda_models.CitaConsumidor).filter(agenda_models.CitaConsumidor.id_usuario_consumidor == id_consumidor).all()
    ids_citas = [v.id_cita for v in vinculos]
    
    citas_historicas = db.query(agenda_models.Cita).filter(
        agenda_models.Cita.id.in_(ids_citas),
        agenda_models.Cita.id_sucursal.in_(ids_sucursales),
        agenda_models.Cita.notas_internas != None,
        agenda_models.Cita.notas_internas != ''
    ).order_by(agenda_models.Cita.fecha_hora_inicio.desc()).all()
    
    notas = []
    for c in citas_historicas:
        fecha_str = c.fecha_hora_inicio.strftime("%d %b %Y")
        # 🌟 NUEVO: Incluimos id_cita
        notas.append({"id_cita": c.id, "fecha": fecha_str, "servicio": c.titulo, "texto": c.notas_internas})
        
    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "correo": usuario.correo,
        "historial_notas": notas
    }