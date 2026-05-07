from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.negocios import models as negocios_models
from backend.negocios import schemas as negocios_schemas
from backend.usuarios import models as usuarios_models

router = APIRouter(
    prefix="/api/negocios",
    tags=["Negocios"]
)

# ==========================================
# 🌟 ENDPOINT 1: INSTALAR UNA SOLUCIÓN
# ==========================================
@router.post("/soluciones/instalar")
def instalar_solucion(request: negocios_schemas.InstalarSolucionRequest, db: Session = Depends(get_db)):
    
    negocio = db.query(negocios_models.Negocio).filter(negocios_models.Negocio.id == request.id_negocio).first()
    if not negocio:
        raise HTTPException(status_code=404, detail="Negocio no encontrado.")
    
    suscripcion = db.query(usuarios_models.Suscripcion).filter(usuarios_models.Suscripcion.id == negocio.id_suscripcion).first()

    soluciones_instaladas = db.query(negocios_models.NegocioSolucion).filter(
        negocios_models.NegocioSolucion.id_negocio == request.id_negocio,
        negocios_models.NegocioSolucion.esta_activa == True
    ).count()

    if soluciones_instaladas >= suscripcion.limite_soluciones:
        raise HTTPException(
            status_code=400, 
            detail=f"Has alcanzado el límite de {suscripcion.limite_soluciones} soluciones de tu plan {suscripcion.nombre_plan}."
        )

    solucion = db.query(negocios_models.Solucion).filter(negocios_models.Solucion.id == request.id_solucion).first()
    if not solucion:
        raise HTTPException(status_code=404, detail="La solución solicitada no existe.")

    instalacion_previa = db.query(negocios_models.NegocioSolucion).filter(
        negocios_models.NegocioSolucion.id_negocio == request.id_negocio,
        negocios_models.NegocioSolucion.id_solucion == request.id_solucion
    ).first()

    if instalacion_previa:
        if not instalacion_previa.esta_activa:
            instalacion_previa.esta_activa = True
            db.commit()
            return {"mensaje": f"¡{solucion.nombre} reactivada con éxito!"}
        raise HTTPException(status_code=400, detail="Esta solución ya está instalada en tu menú.")

    nueva_instalacion = negocios_models.NegocioSolucion(
        id_negocio=request.id_negocio,
        id_solucion=request.id_solucion,
        esta_activa=True
    )
    db.add(nueva_instalacion)
    db.commit()

    return {"mensaje": f"¡{solucion.nombre} instalada con éxito!"}

# ==========================================
# 🌟 ENDPOINT 2: OBTENER SOLUCIONES
# ==========================================
@router.get("/{id_negocio}/soluciones", response_model=list[negocios_schemas.NegocioSolucionResponse])
def obtener_soluciones_negocio(id_negocio: int, db: Session = Depends(get_db)):
    instalaciones = db.query(negocios_models.NegocioSolucion).filter(
        negocios_models.NegocioSolucion.id_negocio == id_negocio,
        negocios_models.NegocioSolucion.esta_activa == True
    ).all()
    
    # 🕵️ SENSOR DEL BACKEND
    print(f"🕵️ BACKEND: Encontré {len(instalaciones)} soluciones para el negocio {id_negocio}.")
    for inst in instalaciones:
        print(f"   -> Enviando Solución ID: {inst.id_solucion}")
        
    return instalaciones

# ==========================================
# 🌟 ENDPOINT 3: DESINSTALAR SOLUCIÓN (Soft Delete)
# ==========================================
@router.delete("/{id_negocio}/soluciones/{id_solucion}")
def desinstalar_solucion(id_negocio: int, id_solucion: int, db: Session = Depends(get_db)):
    instalacion = db.query(negocios_models.NegocioSolucion).filter(
        negocios_models.NegocioSolucion.id_negocio == id_negocio,
        negocios_models.NegocioSolucion.id_solucion == id_solucion,
        negocios_models.NegocioSolucion.esta_activa == True
    ).first()

    if not instalacion:
        raise HTTPException(status_code=404, detail="La solución no está instalada o ya fue removida.")

    instalacion.esta_activa = False
    db.commit()

    return {"mensaje": "Solución desinstalada con éxito"}