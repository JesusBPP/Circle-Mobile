from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.core.database import get_db
from backend.agenda import models as agenda_models
from backend.agenda import schemas as agenda_schemas
from backend.negocios import models as negocios_models
from backend.catalogo import models as catalogo_models

router = APIRouter(
    prefix="/api/agenda",
    tags=["Agenda"]
)

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
        raise HTTPException(
            status_code=400, 
            detail=f"Horario no disponible. Se empalma con la actividad: {empalme.titulo}"
        )

def formatear_cita_response(db: Session, cita: agenda_models.Cita):
    es_cita = db.query(agenda_models.CitaServicio).filter(agenda_models.CitaServicio.id_cita == cita.id).first()
    tipo = "cita" if es_cita else "evento"
    
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
        "tipo": tipo
    }

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
    if not ids_sucursales:
        return []
        
    citas = db.query(agenda_models.Cita).filter(agenda_models.Cita.id_sucursal.in_(ids_sucursales)).all()
    return [formatear_cita_response(db, c) for c in citas]

@router.post("/negocios/{id_negocio}/citas", response_model=agenda_schemas.CitaResponse, status_code=status.HTTP_201_CREATED)
def crear_cita(id_negocio: int, cita: agenda_schemas.CitaCreate, db: Session = Depends(get_db)):
    validar_empalme_citas(db, cita.id_sucursal, cita.fecha_hora_inicio, cita.fecha_hora_fin)
        
    datos_cita = cita.model_dump(exclude={"id_servicio_producto"})
    nueva_cita = agenda_models.Cita(**datos_cita)
    db.add(nueva_cita)
    db.flush() 
    
    if cita.id_servicio_producto:
        cita_serv = agenda_models.CitaServicio(
            id_cita=nueva_cita.id, 
            id_servicio_producto=cita.id_servicio_producto
        )
        db.add(cita_serv)

    db.commit()
    db.refresh(nueva_cita)
    
    return formatear_cita_response(db, nueva_cita)

@router.get("/citas/{id_cita}", response_model=agenda_schemas.CitaResponse)
def obtener_cita(id_cita: int, db: Session = Depends(get_db)):
    cita = db.query(agenda_models.Cita).filter(agenda_models.Cita.id == id_cita).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return formatear_cita_response(db, cita)

@router.put("/citas/{id_cita}", response_model=agenda_schemas.CitaResponse)
def actualizar_cita(id_cita: int, cita_update: agenda_schemas.CitaUpdate, db: Session = Depends(get_db)):
    cita = db.query(agenda_models.Cita).filter(agenda_models.Cita.id == id_cita).first()
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    
    # 🌟 1. LÓGICA CORREGIDA: Procesar fechas primero, sin importar el "Estado"
    fechas_modificadas = False
    if cita_update.fecha_hora_inicio and cita_update.fecha_hora_fin:
        if cita_update.fecha_hora_inicio != cita.fecha_hora_inicio or cita_update.fecha_hora_fin != cita.fecha_hora_fin:
            validar_empalme_citas(db, cita.id_sucursal, cita_update.fecha_hora_inicio, cita_update.fecha_hora_fin, exclude_cita_id=cita.id)
            cita.fecha_hora_inicio = cita_update.fecha_hora_inicio
            cita.fecha_hora_fin = cita_update.fecha_hora_fin
            fechas_modificadas = True

    # 🌟 2. MÁQUINA DE ESTADOS
    transiciones_validas = {
        "Programada": ["Reprogramada", "Finalizada", "Cancelada"],
        "Reprogramada": ["Reprogramada", "Finalizada", "Cancelada"],
        "Pendiente": ["Programada", "Finalizada", "Cancelada"],
        "Finalizada": [],
        "Cancelada": []
    }

    if cita_update.estado and cita_update.estado != cita.estado:
        if cita_update.estado not in transiciones_validas.get(cita.estado, []):
            raise HTTPException(status_code=400, detail=f"Transición inválida de {cita.estado} a {cita_update.estado}.")
        cita.estado = cita_update.estado
    elif fechas_modificadas and cita.estado == "Programada":
        # Autotransición: Si mandó nuevas fechas pero no un nuevo estado explícito, lo cambiamos a Reprogramada
        cita.estado = "Reprogramada"

    # 3. Actualizamos textos
    if cita_update.descripcion is not None:
        cita.descripcion = cita_update.descripcion
    if cita_update.notas_internas is not None:
        cita.notas_internas = cita_update.notas_internas
        
    db.commit()
    db.refresh(cita)
    return formatear_cita_response(db, cita)