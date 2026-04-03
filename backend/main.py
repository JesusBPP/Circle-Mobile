from fastapi import FastAPI
from datetime import date, datetime, timedelta
from sqlalchemy import text  # <-- Importamos 'text' para ejecutar comandos SQL puros
from backend.core.database import engine, Base, SessionLocal

# IMPORTAMOS TODOS LOS MODELOS
from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models
from backend.agenda import models as agenda_models
from backend.catalogo import models as catalogo_models
from backend.lealtad import models as lealtad_models

# Importamos las rutas
from backend.usuarios import router as usuarios_router
from backend.auth import router as auth_router

# Inicializamos la aplicación FastAPI
app = FastAPI(title="Circle API", description="Backend para el ecosistema Circle")

# LE DECIMOS A FASTAPI QUE USE LAS RUTAS DE USUARIOS
app.include_router(usuarios_router.router)
app.include_router(auth_router.router)

# ==========================================

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡El servidor de Circle está corriendo perfectamente!"}

# ==========================================
# FUNCIONES DE CONTROL DE BASE DE DATOS
# ==========================================

def crear_base_datos():
    """Borra la base de datos actual y la vuelve a crear desde cero."""
    print("🧹 Borrando base de datos anterior (Forzando limpieza en cascada)...")
    
    # Usamos una conexión directa para ejecutar SQL puro y borrar las "tablas fantasma"
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        
    print("🏗️ Creando tablas nuevas con la arquitectura V2...")
    # Ahora sí, creamos las tablas desde cero basadas en los modelos actuales
    Base.metadata.create_all(bind=engine)
    print("✅ ¡Base de datos creada exitosamente!")

def llenar_base_datos():
    """Inyecta datos de prueba para desarrollo."""
    db = SessionLocal()
    try:
        if db.query(usuarios_models.Usuario).first():
            print("⚠️ La base de datos ya tiene información. Por favor, recréala primero (Opción 1).")
            return

        print("🌱 Creando Suscripción base...")
        sub_gratis = usuarios_models.Suscripcion(
            nombre_plan="Gratis", 
            limite_soluciones=3, 
            limite_sucursales=1, 
            limite_empleados=15, 
            limite_consumidores=100, 
            limite_productos=50
        )
        db.add(sub_gratis)
        db.commit()
        db.refresh(sub_gratis)

        print("👑 Creando Administradores, Consumidores, Dueños y Empleados...")
        admin1 = usuarios_models.Usuario(nombre="Admin Alpha", correo="admin1@circle.com", contrasena="123", fecha_nacimiento=date(1990, 1, 1), codigo_postal="00000", es_admin_sistema=True)
        cons1 = usuarios_models.Usuario(nombre="Juan Consumidor", correo="juan@gmail.com", contrasena="123", fecha_nacimiento=date(1995, 5, 10), codigo_postal="11111")
        dueno1 = usuarios_models.Usuario(nombre="Carlos Dueño", correo="carlos@negocio.com", contrasena="123", fecha_nacimiento=date(1985, 3, 15), codigo_postal="33333")
        dueno2 = usuarios_models.Usuario(nombre="Ana Dueña", correo="ana@negocio.com", contrasena="123", fecha_nacimiento=date(1988, 11, 30), codigo_postal="44444")
        emp1 = usuarios_models.Usuario(nombre="Pedro Empleado", correo="pedro@negocio.com", contrasena="123", fecha_nacimiento=date(2000, 2, 14), codigo_postal="55555")

        db.add_all([admin1, cons1, dueno1, dueno2, emp1])
        db.commit() 

        print("🏪 Creando Negocios y Sucursales...")
        negocio1 = negocios_models.Negocio(id_dueno=dueno1.id, id_suscripcion=sub_gratis.id, nombre="Cafetería El Grano")
        negocio2 = negocios_models.Negocio(id_dueno=dueno2.id, id_suscripcion=sub_gratis.id, nombre="Barbería Classic")
        db.add_all([negocio1, negocio2])
        db.commit()

        sucursal_cafe = negocios_models.Sucursal(id_negocio=negocio1.id, nombre="Café Centro", calle="Av Hidalgo", numero_exterior="10", colonia="Centro", ciudad="CDMX", estado="CDMX", codigo_postal="10000")
        sucursal_barber = negocios_models.Sucursal(id_negocio=negocio2.id, nombre="Barber Norte", calle="Av Reforma", numero_exterior="25", colonia="Norte", ciudad="CDMX", estado="CDMX", codigo_postal="20000")
        db.add_all([sucursal_cafe, sucursal_barber])
        db.commit()

        print("🤝 Asignando empleados...")
        es1 = negocios_models.EmpleadoSucursal(id_usuario=emp1.id, id_sucursal=sucursal_cafe.id, estado_invitacion="aceptada", permisos="solo_operacion")
        db.add(es1)
        db.commit()

        print("📦 Creando Materiales (Inventario Base)...")
        mat_cafe = catalogo_models.Material(nombre="Kilo de Café Colombia", costo=250.00, cantidad_existencia=10.0)
        mat_leche = catalogo_models.Material(nombre="Litro de Leche Entera", costo=25.00, cantidad_existencia=50.0)
        db.add_all([mat_cafe, mat_leche])
        db.commit()

        print("🏷️ Creando Catálogo Unificado (Productos y Servicios)...")
        prod_capuchino = catalogo_models.ServicioProducto(nombre="Capuchino Grande", costo=65.00, tipo_producto="producto")
        serv_corte = catalogo_models.ServicioProducto(nombre="Corte de Cabello Clásico", costo=250.00, tipo_producto="servicio")
        db.add_all([prod_capuchino, serv_corte])
        db.commit()

        print("🧪 Vinculando Recetas (Materiales a Productos)...")
        receta_capuchino = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_cafe.id, cantidad=0.02) # 20 gramos
        receta_leche = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_leche.id, cantidad=0.25) # 250 ml
        db.add_all([receta_capuchino, receta_leche])
        db.commit()

        print("📍 Asignando Catálogo a Sucursales (Disponibilidad)...")
        disp_cafe = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe.id)
        disp_corte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte.id, id_sucursal=sucursal_barber.id)
        db.add_all([disp_cafe, disp_corte])
        db.commit()

        print("🎁 Creando Ofertas de Lealtad en Sucursales...")
        oferta_bienvenida = lealtad_models.Oferta(id_sucursales=sucursal_cafe.id, titulo="2x1 en tu primer Capuchino", es_publica=True)
        db.add(oferta_bienvenida)
        db.commit()

        print("📅 Creando Citas de Prueba...")
        fecha_cita = datetime.utcnow() + timedelta(days=1)
        cita_prueba = agenda_models.Cita(id_sucursal=sucursal_barber.id, titulo="Corte de Juan", fecha_hora_inicio=fecha_cita, fecha_hora_fin=fecha_cita + timedelta(hours=1), numero_bloques=2)
        db.add(cita_prueba)
        db.commit()

        print("✅ ¡Base de datos llenada con éxito con la estructura v2.0!")

    except Exception as e:
        print(f"❌ Ocurrió un error al llenar la base de datos: {e}")
        db.rollback() 
    finally:
        db.close()