from fastapi import FastAPI
from datetime import date, datetime, timedelta
from sqlalchemy import text 
from backend.core.database import engine, Base, db_manager
from backend.negocios import router as negocios_router

from fastapi.middleware.cors import CORSMiddleware

from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models
from backend.agenda import models as agenda_models
from backend.catalogo import models as catalogo_models
from backend.lealtad import models as lealtad_models

from backend.usuarios import router as usuarios_router
from backend.auth import router as auth_router
from backend.agenda import router as agenda_router

app = FastAPI(title="Circle API", description="Backend para el ecosistema Circle")
app.include_router(negocios_router.router)

# ==========================================
# ESCUDO CORS
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(usuarios_router.router)
app.include_router(auth_router.router)
app.include_router(agenda_router.router)

@app.get("/")
def ruta_raiz():
    return {"mensaje": "¡El servidor de Circle está corriendo perfectamente!"}

# ==========================================
# FUNCIONES DE CONTROL DE BASE DE DATOS
# ==========================================

def crear_base_datos():
    print("🧹 Borrando base de datos anterior (Forzando limpieza en cascada)...")
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
    print("🏗️ Creando tablas nuevas con la arquitectura V2...")
    Base.metadata.create_all(bind=engine)
    print("✅ ¡Base de datos creada exitosamente!")

def llenar_base_datos():
    db = db_manager.obtener_sesion()
    try:
        if db.query(usuarios_models.Usuario).first():
            print("⚠️ La base de datos ya tiene información. Por favor, recréala primero (Opción 1).")
            return

        print("🌱 Creando Suscripción base...")
        sub_gratis = usuarios_models.Suscripcion(
            nombre_plan="Gratis", limite_soluciones=3, limite_sucursales=1, 
            limite_empleados=15, limite_consumidores=100, limite_productos=50
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

        print("🛠️ Creando Catálogo de Soluciones (App Store interna)...")
        solucion_agenda = negocios_models.Solucion(
            nombre="Agenda",
            descripcion="Gestión inteligente de citas y reservas en tiempo real.",
            ruta_frontend="/agenda",
            es_premium_exclusiva=False,
            activa_en_catalogo=True
        )
        solucion_lealtad = negocios_models.Solucion(
            nombre="Lealtad",
            descripcion="Fideliza a tus clientes con puntos, sellos y ofertas dinámicas.",
            ruta_frontend="/lealtad",
            es_premium_exclusiva=False,
            activa_en_catalogo=True
        )
        db.add_all([solucion_agenda, solucion_lealtad])
        db.commit()

        print("📲 Instalando Soluciones en Negocios de prueba...")
        instalacion_agenda = negocios_models.NegocioSolucion(
            id_negocio=negocio1.id,
            id_solucion=solucion_agenda.id,
            esta_activa=True
        )
        db.add(instalacion_agenda)
        db.commit()

        print("📦 Creando Materiales (Inventario Base)...")
        mat_cafe = catalogo_models.Material(nombre="Kilo de Café Colombia", costo=250.00, cantidad_existencia=10.0)
        mat_leche = catalogo_models.Material(nombre="Litro de Leche Entera", costo=25.00, cantidad_existencia=50.0)
        db.add_all([mat_cafe, mat_leche])
        db.commit()

        print("🏷️ Creando Catálogo Unificado (Productos y Servicios)...")
        prod_capuchino = catalogo_models.ServicioProducto(nombre="Capuchino Grande", costo=65.00, tipo_producto="producto")
        serv_corte = catalogo_models.ServicioProducto(nombre="Corte de Cabello Clásico", costo=250.00, tipo_producto="servicio")
        
        # 🌟 NUEVOS SERVICIOS AÑADIDOS PARA PROBAR EL DROPDOWN DE AGENDA
        serv_reserva = catalogo_models.ServicioProducto(nombre="Reserva de Mesa VIP", costo=100.00, tipo_producto="servicio")
        serv_cata = catalogo_models.ServicioProducto(nombre="Cata de Café de Especialidad", costo=350.00, tipo_producto="servicio")
        serv_barba = catalogo_models.ServicioProducto(nombre="Arreglo de Barba Premium", costo=180.00, tipo_producto="servicio")
        
        db.add_all([prod_capuchino, serv_corte, serv_reserva, serv_cata, serv_barba])
        db.commit()

        print("🪙 Configurando Programa de Lealtad para Cafetería El Grano...")
        config_lealtad = lealtad_models.ConfiguracionLealtad(
            id_negocio=negocio1.id,
            tasa_puntos_por_peso=1.0, 
            puntos_por_visita=5,      
            id_producto_estrella=prod_capuchino.id,
            multiplicador_producto=2.0, 
            meses_vigencia_puntos=12
        )
        db.add(config_lealtad)
        db.commit()

        print("💳 Creando Cartera de Lealtad para Juan Consumidor...")
        cartera_juan = lealtad_models.CarteraLealtad(
            id_usuario_consumidor=cons1.id,
            id_negocio=negocio1.id,
            saldo_puntos=150.50,
            saldo_sellos=3
        )
        db.add(cartera_juan)
        db.commit()

        print("🧪 Vinculando Recetas (Materiales a Productos)...")
        receta_capuchino = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_cafe.id, cantidad=0.02)
        receta_leche = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_leche.id, cantidad=0.25)
        db.add_all([receta_capuchino, receta_leche])
        db.commit()

        print("📍 Asignando Catálogo a Sucursales (Disponibilidad)...")
        disp_cafe = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe.id)
        disp_corte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte.id, id_sucursal=sucursal_barber.id)
        
        # 🌟 NUEVAS ASIGNACIONES DE DISPONIBILIDAD PARA LOS SERVICIOS
        disp_reserva = catalogo_models.ServicioDisponible(id_servicio_producto=serv_reserva.id, id_sucursal=sucursal_cafe.id)
        disp_cata = catalogo_models.ServicioDisponible(id_servicio_producto=serv_cata.id, id_sucursal=sucursal_cafe.id)
        disp_barba = catalogo_models.ServicioDisponible(id_servicio_producto=serv_barba.id, id_sucursal=sucursal_barber.id)
        
        db.add_all([disp_cafe, disp_corte, disp_reserva, disp_cata, disp_barba])
        db.commit()

        print("🎁 Creando Ofertas de Lealtad en Sucursales...")
        oferta_bienvenida = lealtad_models.Oferta(
            id_sucursales=sucursal_cafe.id, 
            titulo="2x1 en tu primer Capuchino", 
            es_publica=True,
            costo_en_puntos=500.0 
        )
        db.add(oferta_bienvenida)
        db.commit()

        # ========================================================
        # 🌟 NUEVO: CREANDO CITAS Y EVENTOS PARA AMBOS NEGOCIOS
        # ========================================================
        print("📅 Creando Citas y Eventos de Prueba...")
        hoy = datetime.utcnow()

        # 1. Cita original para la Barbería de Ana
        cita_barberia = agenda_models.Cita(
            id_sucursal=sucursal_barber.id, 
            titulo="Corte de Juan", 
            descripcion="Corte clásico",
            fecha_hora_inicio=hoy + timedelta(days=1), 
            fecha_hora_fin=hoy + timedelta(days=1, hours=1), 
            numero_bloques=2,
            estado="Programada"
        )

        # 2. 🌟 Citas para la Cafetería de Carlos Dueño (Diferentes Estados)
        cita_carlos_1 = agenda_models.Cita(
            id_sucursal=sucursal_cafe.id,
            titulo="Cata de Café VIP",
            descripcion="Degustación privada de granos colombianos",
            fecha_hora_inicio=hoy - timedelta(days=1), # Fue ayer
            fecha_hora_fin=hoy - timedelta(days=1) + timedelta(hours=2),
            numero_bloques=4,
            estado="Finalizada" # Aparecerá en Dorado Metálico en el Frontend
        )

        cita_carlos_2 = agenda_models.Cita(
            id_sucursal=sucursal_cafe.id,
            titulo="Reserva Mesa 4",
            descripcion="Cumpleaños de Juan Consumidor",
            fecha_hora_inicio=hoy + timedelta(days=2), # En dos días
            fecha_hora_fin=hoy + timedelta(days=2) + timedelta(hours=1),
            numero_bloques=2,
            estado="Programada" # Aparecerá en Zafiro/Esmeralda
        )

        cita_carlos_3 = agenda_models.Cita(
            id_sucursal=sucursal_cafe.id,
            titulo="Entrevista Barista",
            descripcion="Candidato: Luis Pérez",
            fecha_hora_inicio=hoy + timedelta(hours=3), # En unas horas
            fecha_hora_fin=hoy + timedelta(hours=4),
            numero_bloques=2,
            estado="Pendiente"
        )

        cita_carlos_4 = agenda_models.Cita(
            id_sucursal=sucursal_cafe.id,
            titulo="Evento Corporativo",
            descripcion="Reunión equipo de ventas",
            fecha_hora_inicio=hoy + timedelta(days=5),
            fecha_hora_fin=hoy + timedelta(days=5) + timedelta(hours=3),
            numero_bloques=6,
            estado="Cancelada"
        )

        db.add_all([cita_barberia, cita_carlos_1, cita_carlos_2, cita_carlos_3, cita_carlos_4])
        db.commit()
        # ========================================================

        # 🌟 Conectando las citas con los servicios para que el backend las reconozca como "citas" y no como "eventos"
        citas_servicios_vinc = [
            agenda_models.CitaServicio(id_cita=cita_barberia.id, id_servicio_producto=serv_corte.id),
            agenda_models.CitaServicio(id_cita=cita_carlos_1.id, id_servicio_producto=serv_cata.id),
            agenda_models.CitaServicio(id_cita=cita_carlos_2.id, id_servicio_producto=serv_reserva.id),
        ]
        db.add_all(citas_servicios_vinc)
        db.commit()

        print("✅ ¡Base de datos llenada con éxito incluyendo Soluciones, Lealtad y Agenda Completa!")

    except Exception as e:
        print(f"❌ Ocurrió un error al llenar la base de datos: {e}")
        db.rollback() 
    finally:
        db.close()