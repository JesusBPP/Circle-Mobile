from datetime import date, datetime, timedelta
from sqlalchemy import text 
from backend.core.database import engine, Base, db_manager
from backend.auth.security import hash_password

# Importación de Modelos para la creación de tablas y semilla
from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models
from backend.agenda import models as agenda_models
from backend.catalogo import models as catalogo_models
from backend.lealtad import models as lealtad_models
from backend.finanzas import models as finanzas_models

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
        sub_premium = usuarios_models.Suscripcion(
            nombre_plan="Premium", limite_soluciones=10, limite_sucursales=5, 
            limite_empleados=50, limite_consumidores=1000, limite_productos=500
        )
        db.add_all([sub_gratis, sub_premium])
        db.commit()
        db.refresh(sub_gratis)
        db.refresh(sub_premium)

        print("👑 Creando Administradores, Consumidores, Dueños y Empleados...")
        admin1 = usuarios_models.Usuario(nombre="Admin Alpha", correo="admin1@circle.com", contrasena=hash_password("123"), fecha_nacimiento=date(1990, 1, 1), codigo_postal="00000", es_admin_sistema=True)
        
        dueno1 = usuarios_models.Usuario(nombre="Carlos Dueño", correo="carlos@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1985, 3, 15), codigo_postal="33333")
        dueno2 = usuarios_models.Usuario(nombre="Ana Dueña", correo="ana@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1988, 11, 30), codigo_postal="44444")
        dueno3 = usuarios_models.Usuario(nombre="Luis Dueño", correo="luis@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1982, 7, 20), codigo_postal="55555")
        dueno4 = usuarios_models.Usuario(nombre="María Dueña", correo="maria@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1991, 4, 12), codigo_postal="66666")
        dueno5 = usuarios_models.Usuario(nombre="Roberto Dueño", correo="roberto@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1979, 9, 5), codigo_postal="77777")
        
        emp1 = usuarios_models.Usuario(nombre="Pedro Empleado", correo="pedro@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(2000, 2, 14), codigo_postal="88888")
        emp2 = usuarios_models.Usuario(nombre="Laura Empleada", correo="laura@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1998, 6, 25), codigo_postal="99999")
        emp3 = usuarios_models.Usuario(nombre="Miguel Empleado", correo="miguel@negocio.com", contrasena=hash_password("123"), fecha_nacimiento=date(1995, 12, 8), codigo_postal="10101")
        
        cons1 = usuarios_models.Usuario(nombre="Juan Consumidor", correo="juan@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1995, 5, 10), codigo_postal="11111")
        cons2 = usuarios_models.Usuario(nombre="María García", correo="maria.garcia@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1992, 8, 15), codigo_postal="12121")
        cons3 = usuarios_models.Usuario(nombre="Carlos López", correo="carlos.lopez@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1988, 3, 22), codigo_postal="13131")
        cons4 = usuarios_models.Usuario(nombre="Ana Martínez", correo="ana.martinez@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1996, 11, 3), codigo_postal="14141")
        cons5 = usuarios_models.Usuario(nombre="Roberto Hernández", correo="roberto.hdz@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1990, 7, 18), codigo_postal="15151")
        cons6 = usuarios_models.Usuario(nombre="Patricia Ramírez", correo="paty.ramirez@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1994, 2, 28), codigo_postal="16161")
        cons7 = usuarios_models.Usuario(nombre="Fernando Torres", correo="fer.torres@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1987, 10, 9), codigo_postal="17171")
        cons8 = usuarios_models.Usuario(nombre="Gabriela Flores", correo="gaby.flores@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1993, 6, 14), codigo_postal="18181")
        cons9 = usuarios_models.Usuario(nombre="Diego Morales", correo="diego.morales@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1991, 1, 30), codigo_postal="19191")
        cons10 = usuarios_models.Usuario(nombre="Sofía Vargas", correo="sofia.vargas@gmail.com", contrasena=hash_password("123"), fecha_nacimiento=date(1997, 9, 21), codigo_postal="20202")

        db.add_all([admin1, dueno1, dueno2, dueno3, dueno4, dueno5, emp1, emp2, emp3,
                    cons1, cons2, cons3, cons4, cons5, cons6, cons7, cons8, cons9, cons10])
        db.commit() 

        print("🏪 Creando Negocios y Sucursales...")
        negocio1 = negocios_models.Negocio(id_dueno=dueno1.id, id_suscripcion=sub_premium.id, nombre="Cafetería El Grano", descripcion="El mejor café colombiano de la ciudad.")
        negocio2 = negocios_models.Negocio(id_dueno=dueno2.id, id_suscripcion=sub_gratis.id, nombre="Barbería Classic", descripcion="Cortes tradicionales y modernos.")
        negocio3 = negocios_models.Negocio(id_dueno=dueno3.id, id_suscripcion=sub_premium.id, nombre="Spa Relajación Total", descripcion="Masajes y tratamientos corporales.")
        negocio4 = negocios_models.Negocio(id_dueno=dueno4.id, id_suscripcion=sub_gratis.id, nombre="Gimnasio PowerFit", descripcion="Tu mejor versión empieza aquí.")
        negocio5 = negocios_models.Negocio(id_dueno=dueno5.id, id_suscripcion=sub_premium.id, nombre="Restaurante La Casa", descripcion="Cocina mexicana tradicional.")
        db.add_all([negocio1, negocio2, negocio3, negocio4, negocio5])
        db.commit()

        sucursal_cafe_centro = negocios_models.Sucursal(id_negocio=negocio1.id, nombre="Café Centro", calle="Av Hidalgo", numero_exterior="10", colonia="Centro", ciudad="CDMX", estado="CDMX", codigo_postal="10000", calificacion_promedio=4.8, total_resenas=15)
        sucursal_cafe_sur = negocios_models.Sucursal(id_negocio=negocio1.id, nombre="Café Sur", calle="Av Insurgentes", numero_exterior="250", colonia="Del Valle", ciudad="CDMX", estado="CDMX", codigo_postal="10100", calificacion_promedio=4.5, total_resenas=8)
        sucursal_cafe_norte = negocios_models.Sucursal(id_negocio=negocio1.id, nombre="Café Norte", calle="Av Revolución", numero_exterior="500", colonia="San Ángel", ciudad="CDMX", estado="CDMX", codigo_postal="10200", calificacion_promedio=4.9, total_resenas=22)
        
        sucursal_barber_norte = negocios_models.Sucursal(id_negocio=negocio2.id, nombre="Barber Norte", calle="Av Reforma", numero_exterior="25", colonia="Norte", ciudad="CDMX", estado="CDMX", codigo_postal="20000", calificacion_promedio=4.6, total_resenas=12)
        sucursal_barber_centro = negocios_models.Sucursal(id_negocio=negocio2.id, nombre="Barber Centro", calle="Calle 5 de Mayo", numero_exterior="100", colonia="Centro", ciudad="CDMX", estado="CDMX", codigo_postal="20100", calificacion_promedio=4.7, total_resenas=18)
        
        sucursal_spa = negocios_models.Sucursal(id_negocio=negocio3.id, nombre="Spa Polanco", calle="Av Presidente Masaryk", numero_exterior="300", colonia="Polanco", ciudad="CDMX", estado="CDMX", codigo_postal="30000", calificacion_promedio=4.9, total_resenas=45)
        sucursal_spa_coyoacan = negocios_models.Sucursal(id_negocio=negocio3.id, nombre="Spa Coyoacán", calle="Calle Francisco Sosa", numero_exterior="50", colonia="Coyoacán", ciudad="CDMX", estado="CDMX", codigo_postal="30100", calificacion_promedio=4.8, total_resenas=30)
        
        sucursal_gym = negocios_models.Sucursal(id_negocio=negocio4.id, nombre="Gym Roma", calle="Calle Orizaba", numero_exterior="80", colonia="Roma Norte", ciudad="CDMX", estado="CDMX", codigo_postal="40000", calificacion_promedio=4.4, total_resenas=25)
        
        sucursal_restaurante = negocios_models.Sucursal(id_negocio=negocio5.id, nombre="Restaurante Centro", calle="Calle Madero", numero_exterior="15", colonia="Centro", ciudad="CDMX", estado="CDMX", codigo_postal="50000", calificacion_promedio=4.7, total_resenas=55)
        sucursal_restaurante_sur = negocios_models.Sucursal(id_negocio=negocio5.id, nombre="Restaurante Sur", calle="Av Universidad", numero_exterior="1000", colonia="Copilco", ciudad="CDMX", estado="CDMX", codigo_postal="50100", calificacion_promedio=4.6, total_resenas=40)
        
        db.add_all([sucursal_cafe_centro, sucursal_cafe_sur, sucursal_cafe_norte,
                    sucursal_barber_norte, sucursal_barber_centro,
                    sucursal_spa, sucursal_spa_coyoacan,
                    sucursal_gym,
                    sucursal_restaurante, sucursal_restaurante_sur])
        db.commit()

        print("🤝 Asignando empleados...")
        es1 = negocios_models.EmpleadoSucursal(id_usuario=emp1.id, id_sucursal=sucursal_cafe_centro.id, estado_invitacion="aceptada", permisos="solo_operacion")
        es2 = negocios_models.EmpleadoSucursal(id_usuario=emp2.id, id_sucursal=sucursal_cafe_sur.id, estado_invitacion="aceptada", permisos="solo_operacion")
        es3 = negocios_models.EmpleadoSucursal(id_usuario=emp3.id, id_sucursal=sucursal_barber_norte.id, estado_invitacion="aceptada", permisos="solo_operacion")
        db.add_all([es1, es2, es3])
        db.commit()

        print("🛠️ Creando Catálogo de Soluciones (App Store interna)...")
        solucion_agenda = negocios_models.Solucion(nombre="Agenda", descripcion="Gestión de citas", ruta_frontend="/agenda", es_premium_exclusiva=False, activa_en_catalogo=True)
        solucion_lealtad = negocios_models.Solucion(nombre="Lealtad", descripcion="Puntos y ofertas", ruta_frontend="/lealtad", es_premium_exclusiva=False, activa_en_catalogo=True)
        solucion_catalogo = negocios_models.Solucion(nombre="Catálogo", descripcion="Productos y servicios", ruta_frontend="/catalogo", es_premium_exclusiva=False, activa_en_catalogo=True)
        db.add_all([solucion_agenda, solucion_lealtad, solucion_catalogo])
        db.commit()

        print("📲 Instalando Soluciones...")
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio1.id, id_solucion=solucion_agenda.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio1.id, id_solucion=solucion_lealtad.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio1.id, id_solucion=solucion_catalogo.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio2.id, id_solucion=solucion_agenda.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio2.id, id_solucion=solucion_lealtad.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio3.id, id_solucion=solucion_agenda.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio3.id, id_solucion=solucion_lealtad.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio4.id, id_solucion=solucion_agenda.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio5.id, id_solucion=solucion_agenda.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.add(negocios_models.NegocioSolucion(id_negocio=negocio5.id, id_solucion=solucion_lealtad.id, esta_activa=True, fecha_instalacion=datetime.utcnow()))
        db.commit()

        print("📦 Creando Catálogo Unificado y Disponibilidad...")
        mat_cafe = catalogo_models.Material(nombre="Kilo Café Colombia", costo=250.00, cantidad_existencia=10.0)
        mat_leche = catalogo_models.Material(nombre="Litro Leche Entera", costo=25.00, cantidad_existencia=50.0)
        mat_pan = catalogo_models.Material(nombre="Pan Artesanal", costo=80.00, cantidad_existencia=30.0)
        mat_champú = catalogo_models.Material(nombre="Champú Profesional", costo=150.00, cantidad_existencia=20.0)
        mat_aceite = catalogo_models.Material(nombre="Aceite para Masaje", costo=200.00, cantidad_existencia=15.0)
        db.add_all([mat_cafe, mat_leche, mat_pan, mat_champú, mat_aceite])
        db.commit()
        
        prod_capuchino = catalogo_models.ServicioProducto(nombre="Capuchino Grande", costo=65.00, tipo_producto="producto")
        prod_latte = catalogo_models.ServicioProducto(nombre="Latte Vainilla", costo=70.00, tipo_producto="producto")
        prod_americano = catalogo_models.ServicioProducto(nombre="Café Americano", costo=45.00, tipo_producto="producto")
        prod_croissant = catalogo_models.ServicioProducto(nombre="Croissant de Jamón", costo=55.00, tipo_producto="producto")
        prod_pastel = catalogo_models.ServicioProducto(nombre="Pastel de Chocolate", costo=85.00, tipo_producto="producto")
        
        serv_reserva = catalogo_models.ServicioProducto(nombre="Reserva Mesa VIP", costo=100.00, tipo_producto="servicio")
        serv_cata = catalogo_models.ServicioProducto(nombre="Cata de Café", costo=200.00, tipo_producto="servicio")
        serv_preparacion = catalogo_models.ServicioProducto(nombre="Clase de Preparación", costo=350.00, tipo_producto="servicio")
        serv_evento = catalogo_models.ServicioProducto(nombre="Evento Privado", costo=1500.00, tipo_producto="servicio")
        serv_domicilio = catalogo_models.ServicioProducto(nombre="Servicio a Domicilio", costo=50.00, tipo_producto="servicio")
        serv_corte = catalogo_models.ServicioProducto(nombre="Corte de Cabello", costo=250.00, tipo_producto="servicio")
        serv_barba = catalogo_models.ServicioProducto(nombre="Arreglo de Barba", costo=180.00, tipo_producto="servicio")
        serv_corte_barba = catalogo_models.ServicioProducto(nombre="Corte + Barba", costo=380.00, tipo_producto="servicio")
        serv_masaje = catalogo_models.ServicioProducto(nombre="Masaje Relajante 60min", costo=800.00, tipo_producto="servicio")
        serv_facial = catalogo_models.ServicioProducto(nombre="Tratamiento Facial", costo=650.00, tipo_producto="servicio")
        serv_piedras = catalogo_models.ServicioProducto(nombre="Masaje con Piedras Calientes", costo=1200.00, tipo_producto="servicio")
        serv_membresia = catalogo_models.ServicioProducto(nombre="Membresía Mensual", costo=800.00, tipo_producto="servicio")
        serv_clase = catalogo_models.ServicioProducto(nombre="Clase Personalizada", costo=350.00, tipo_producto="servicio")
        serv_comida = catalogo_models.ServicioProducto(nombre="Platillo del Día", costo=180.00, tipo_producto="servicio")
        serv_bebida = catalogo_models.ServicioProducto(nombre="Bebida Artesanal", costo=90.00, tipo_producto="servicio")
        
        db.add_all([prod_capuchino, prod_latte, prod_americano, prod_croissant, prod_pastel,
                    serv_reserva, serv_cata, serv_preparacion, serv_evento, serv_domicilio,
                    serv_corte, serv_barba, serv_corte_barba,
                    serv_masaje, serv_facial, serv_piedras,
                    serv_membresia, serv_clase,
                    serv_comida, serv_bebida])
        db.commit()
        
        receta_cap = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_cafe.id, cantidad=0.02)
        receta_latte = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_latte.id, id_material=mat_cafe.id, cantidad=0.02)
        receta_croissant = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_croissant.id, id_material=mat_pan.id, cantidad=0.1)
        db.add_all([receta_cap, receta_latte, receta_croissant])
        db.commit()

        disp_cafe_centro = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe_centro.id)
        disp_latte_centro = catalogo_models.ServicioDisponible(id_servicio_producto=prod_latte.id, id_sucursal=sucursal_cafe_centro.id)
        disp_americano_centro = catalogo_models.ServicioDisponible(id_servicio_producto=prod_americano.id, id_sucursal=sucursal_cafe_centro.id)
        disp_croissant_centro = catalogo_models.ServicioDisponible(id_servicio_producto=prod_croissant.id, id_sucursal=sucursal_cafe_centro.id)
        disp_pastel_centro = catalogo_models.ServicioDisponible(id_servicio_producto=prod_pastel.id, id_sucursal=sucursal_cafe_centro.id)
        disp_reserva_centro = catalogo_models.ServicioDisponible(id_servicio_producto=serv_reserva.id, id_sucursal=sucursal_cafe_centro.id)
        disp_cata_centro = catalogo_models.ServicioDisponible(id_servicio_producto=serv_cata.id, id_sucursal=sucursal_cafe_centro.id)
        disp_preparacion_centro = catalogo_models.ServicioDisponible(id_servicio_producto=serv_preparacion.id, id_sucursal=sucursal_cafe_centro.id)
        disp_evento_centro = catalogo_models.ServicioDisponible(id_servicio_producto=serv_evento.id, id_sucursal=sucursal_cafe_centro.id)
        
        disp_cafe_sur = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe_sur.id)
        disp_latte_sur = catalogo_models.ServicioDisponible(id_servicio_producto=prod_latte.id, id_sucursal=sucursal_cafe_sur.id)
        disp_americano_sur = catalogo_models.ServicioDisponible(id_servicio_producto=prod_americano.id, id_sucursal=sucursal_cafe_sur.id)
        disp_cata_sur = catalogo_models.ServicioDisponible(id_servicio_producto=serv_cata.id, id_sucursal=sucursal_cafe_sur.id)
        disp_domicilio_sur = catalogo_models.ServicioDisponible(id_servicio_producto=serv_domicilio.id, id_sucursal=sucursal_cafe_sur.id)
        
        disp_cafe_norte = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe_norte.id)
        disp_latte_norte = catalogo_models.ServicioDisponible(id_servicio_producto=prod_latte.id, id_sucursal=sucursal_cafe_norte.id)
        disp_pastel_norte = catalogo_models.ServicioDisponible(id_servicio_producto=prod_pastel.id, id_sucursal=sucursal_cafe_norte.id)
        
        disp_corte_norte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte.id, id_sucursal=sucursal_barber_norte.id)
        disp_barba_norte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_barba.id, id_sucursal=sucursal_barber_norte.id)
        disp_corte_barba_norte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte_barba.id, id_sucursal=sucursal_barber_norte.id)
        
        disp_corte_centro_barber = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte.id, id_sucursal=sucursal_barber_centro.id)
        disp_barba_centro_barber = catalogo_models.ServicioDisponible(id_servicio_producto=serv_barba.id, id_sucursal=sucursal_barber_centro.id)
        
        disp_masaje_polanco = catalogo_models.ServicioDisponible(id_servicio_producto=serv_masaje.id, id_sucursal=sucursal_spa.id)
        disp_facial_polanco = catalogo_models.ServicioDisponible(id_servicio_producto=serv_facial.id, id_sucursal=sucursal_spa.id)
        disp_piedras_polanco = catalogo_models.ServicioDisponible(id_servicio_producto=serv_piedras.id, id_sucursal=sucursal_spa.id)
        
        disp_masaje_coyoacan = catalogo_models.ServicioDisponible(id_servicio_producto=serv_masaje.id, id_sucursal=sucursal_spa_coyoacan.id)
        disp_facial_coyoacan = catalogo_models.ServicioDisponible(id_servicio_producto=serv_facial.id, id_sucursal=sucursal_spa_coyoacan.id)
        
        disp_membresia_gym = catalogo_models.ServicioDisponible(id_servicio_producto=serv_membresia.id, id_sucursal=sucursal_gym.id)
        disp_clase_gym = catalogo_models.ServicioDisponible(id_servicio_producto=serv_clase.id, id_sucursal=sucursal_gym.id)
        
        disp_comida_rest = catalogo_models.ServicioDisponible(id_servicio_producto=serv_comida.id, id_sucursal=sucursal_restaurante.id)
        disp_bebida_rest = catalogo_models.ServicioDisponible(id_servicio_producto=serv_bebida.id, id_sucursal=sucursal_restaurante.id)
        disp_comida_rest_sur = catalogo_models.ServicioDisponible(id_servicio_producto=serv_comida.id, id_sucursal=sucursal_restaurante_sur.id)
        disp_bebida_rest_sur = catalogo_models.ServicioDisponible(id_servicio_producto=serv_bebida.id, id_sucursal=sucursal_restaurante_sur.id)
        
        db.add_all([disp_cafe_centro, disp_latte_centro, disp_americano_centro, disp_croissant_centro, disp_pastel_centro, disp_reserva_centro, disp_cata_centro, disp_preparacion_centro, disp_evento_centro,
                    disp_cafe_sur, disp_latte_sur, disp_americano_sur, disp_cata_sur, disp_domicilio_sur,
                    disp_cafe_norte, disp_latte_norte, disp_pastel_norte,
                    disp_corte_norte, disp_barba_norte, disp_corte_barba_norte,
                    disp_corte_centro_barber, disp_barba_centro_barber,
                    disp_masaje_polanco, disp_facial_polanco, disp_piedras_polanco,
                    disp_masaje_coyoacan, disp_facial_coyoacan,
                    disp_membresia_gym, disp_clase_gym,
                    disp_comida_rest, disp_bebida_rest, disp_comida_rest_sur, disp_bebida_rest_sur])
        db.commit()

        print("🏦 Abriendo Cajas y Sesiones de Turno...")
        caja_cafe_centro = finanzas_models.CajaFisica(id_sucursal=sucursal_cafe_centro.id, nombre="Caja Mostrador 1", esta_activa=True)
        caja_cafe_sur = finanzas_models.CajaFisica(id_sucursal=sucursal_cafe_sur.id, nombre="Caja Mostrador", esta_activa=True)
        caja_barber = finanzas_models.CajaFisica(id_sucursal=sucursal_barber_norte.id, nombre="Caja Principal", esta_activa=True)
        caja_spa = finanzas_models.CajaFisica(id_sucursal=sucursal_spa.id, nombre="Caja Recepción", esta_activa=True)
        caja_restaurante = finanzas_models.CajaFisica(id_sucursal=sucursal_restaurante.id, nombre="Caja Principal", esta_activa=True)
        db.add_all([caja_cafe_centro, caja_cafe_sur, caja_barber, caja_spa, caja_restaurante])
        db.commit()

        sesion_emp1 = finanzas_models.SesionCaja(id_caja_fisica=caja_cafe_centro.id, id_usuario=emp1.id, fondo_inicial=500.00, fecha_apertura=datetime.utcnow())
        sesion_emp2 = finanzas_models.SesionCaja(id_caja_fisica=caja_cafe_sur.id, id_usuario=emp2.id, fondo_inicial=500.00, fecha_apertura=datetime.utcnow())
        sesion_emp3 = finanzas_models.SesionCaja(id_caja_fisica=caja_barber.id, id_usuario=emp3.id, fondo_inicial=300.00, fecha_apertura=datetime.utcnow())
        db.add_all([sesion_emp1, sesion_emp2, sesion_emp3])
        db.commit()

        print("💳 Simulando Transacciones y Detalles...")
        trans1 = finanzas_models.Transaccion(id_usuario_consumidor=cons1.id, id_sesion_caja=sesion_emp1.id, monto_total=165.00, metodo_pago="efectivo", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        trans2 = finanzas_models.Transaccion(id_usuario_consumidor=cons2.id, id_sesion_caja=sesion_emp1.id, monto_total=135.00, metodo_pago="tarjeta", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        trans3 = finanzas_models.Transaccion(id_usuario_consumidor=cons3.id, id_sesion_caja=sesion_emp2.id, monto_total=70.00, metodo_pago="efectivo", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        trans4 = finanzas_models.Transaccion(id_usuario_consumidor=cons4.id, id_sesion_caja=sesion_emp3.id, monto_total=250.00, metodo_pago="tarjeta", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        trans5 = finanzas_models.Transaccion(id_usuario_consumidor=cons5.id, id_sesion_caja=sesion_emp3.id, monto_total=380.00, metodo_pago="efectivo", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        db.add_all([trans1, trans2, trans3, trans4, trans5])
        db.commit()
        
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans1.id, id_servicios_productos_disponibles=disp_cafe_centro.id, cantidad=1, subtotal=65.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans1.id, id_servicios_productos_disponibles=disp_reserva_centro.id, cantidad=1, subtotal=100.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans2.id, id_servicios_productos_disponibles=disp_latte_centro.id, cantidad=1, subtotal=70.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans2.id, id_servicios_productos_disponibles=disp_croissant_centro.id, cantidad=1, subtotal=55.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans3.id, id_servicios_productos_disponibles=disp_latte_sur.id, cantidad=1, subtotal=70.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans4.id, id_servicios_productos_disponibles=disp_corte_norte.id, cantidad=1, subtotal=250.00))
        db.add(finanzas_models.DetalleTransaccion(id_transaccion=trans5.id, id_servicios_productos_disponibles=disp_corte_barba_norte.id, cantidad=1, subtotal=380.00))
        db.commit()

        print("💰 Registrando Movimientos Manuales de Efectivo...")
        mov_ingreso1 = finanzas_models.MovimientoEfectivo(id_sesion_caja=sesion_emp1.id, tipo_movimiento="ingreso", monto=500.00, concepto="Venta de merchandise", fecha=datetime.utcnow())
        mov_egreso1 = finanzas_models.MovimientoEfectivo(id_sesion_caja=sesion_emp1.id, tipo_movimiento="egreso", monto=200.00, concepto="Pago proveedor de agua", fecha=datetime.utcnow())
        mov_ingreso2 = finanzas_models.MovimientoEfectivo(id_sesion_caja=sesion_emp2.id, tipo_movimiento="ingreso", monto=150.00, concepto="Propina extra", fecha=datetime.utcnow())
        db.add_all([mov_ingreso1, mov_egreso1, mov_ingreso2])
        db.commit()

        print("🔒 Cerrando Sesiones de Caja (con cuadratura y descuadre)...")
        sesion_emp1.fecha_cierre = datetime.utcnow()
        sesion_emp1.efectivo_contado_al_cierre = 1000.00
        sesion_emp2.fecha_cierre = datetime.utcnow()
        sesion_emp2.efectivo_contado_al_cierre = 120.00
        db.commit()

        print("📅 Creando Citas y Agenda Whitelist...")
        hoy = datetime.utcnow()
        
        db.add(agenda_models.AgendaWhitelist(id_sucursales=sucursal_cafe_centro.id, id_usuario_consumidor=cons1.id))
        db.add(agenda_models.AgendaWhitelist(id_sucursales=sucursal_cafe_centro.id, id_usuario_consumidor=cons2.id))
        db.add(agenda_models.AgendaWhitelist(id_sucursales=sucursal_barber_norte.id, id_usuario_consumidor=cons4.id))
        db.add(agenda_models.AgendaWhitelist(id_sucursales=sucursal_spa.id, id_usuario_consumidor=cons6.id))
        db.commit()

        cita1 = agenda_models.Cita(id_sucursal=sucursal_cafe_centro.id, titulo="Reserva Mesa 4", fecha_hora_inicio=hoy + timedelta(days=2), fecha_hora_fin=hoy + timedelta(days=2, hours=1), numero_bloques=2, estado="programada")
        cita2 = agenda_models.Cita(id_sucursal=sucursal_barber_norte.id, titulo="Corte Caballero", fecha_hora_inicio=hoy + timedelta(days=1, hours=3), fecha_hora_fin=hoy + timedelta(days=1, hours=4), numero_bloques=1, estado="programada")
        cita3 = agenda_models.Cita(id_sucursal=sucursal_spa.id, titulo="Masaje Relajante", fecha_hora_inicio=hoy + timedelta(days=3, hours=2), fecha_hora_fin=hoy + timedelta(days=3, hours=3), numero_bloques=1, estado="programada")
        cita4 = agenda_models.Cita(id_sucursal=sucursal_cafe_sur.id, titulo="Reserva Mesa 2", fecha_hora_inicio=hoy - timedelta(days=1), fecha_hora_fin=hoy - timedelta(days=1, hours=-1), numero_bloques=2, estado="finalizada")
        cita5 = agenda_models.Cita(id_sucursal=sucursal_cafe_centro.id, titulo="Cita Cancelada", fecha_hora_inicio=hoy + timedelta(days=5), fecha_hora_fin=hoy + timedelta(days=5, hours=1), numero_bloques=2, estado="cancelada")
        cita6 = agenda_models.Cita(id_sucursal=sucursal_barber_centro.id, titulo="Cita Reagendada", fecha_hora_inicio=hoy + timedelta(days=7), fecha_hora_fin=hoy + timedelta(days=7, hours=1), numero_bloques=1, estado="reagenda")
        cita7 = agenda_models.Cita(id_sucursal=sucursal_spa_coyoacan.id, titulo="Cita Completada", fecha_hora_inicio=hoy - timedelta(days=3), fecha_hora_fin=hoy - timedelta(days=3, hours=1), numero_bloques=1, estado="completada")
        db.add_all([cita1, cita2, cita3, cita4, cita5, cita6, cita7])
        db.commit()
        
        db.add(agenda_models.CitaServicio(id_cita=cita1.id, id_servicio_disponible=disp_reserva_centro.id, costo_actual=100.00))
        db.add(agenda_models.CitaServicio(id_cita=cita2.id, id_servicio_disponible=disp_corte_norte.id, costo_actual=250.00))
        db.add(agenda_models.CitaServicio(id_cita=cita3.id, id_servicio_disponible=disp_masaje_polanco.id, costo_actual=800.00))
        db.add(agenda_models.CitaServicio(id_cita=cita4.id, id_servicio_disponible=disp_cafe_centro.id, costo_actual=65.00))
        
        db.add(agenda_models.CitaConsumidor(id_cita=cita1.id, id_usuario_consumidor=cons1.id))
        db.add(agenda_models.CitaConsumidor(id_cita=cita2.id, id_usuario_consumidor=cons4.id))
        db.add(agenda_models.CitaConsumidor(id_cita=cita3.id, id_usuario_consumidor=cons6.id))
        db.add(agenda_models.CitaConsumidor(id_cita=cita4.id, id_usuario_consumidor=cons3.id))
        
        db.add(agenda_models.ArchivoCita(id_cita=cita1.id, url_archivo="https://s3/file.pdf", nombre_archivo="MenuEspecial.pdf", tipo_archivo="pdf", tamano_mb=1.5, fecha_subida=hoy))
        db.commit()

        print("📊 Creando CRM Clientes de Negocio y Reseñas...")
        db.add(usuarios_models.CRMClienteNegocio(id_sucursales=sucursal_cafe_centro.id, id_usuario_consumidor=cons1.id, segmento_calculado="Leal", fecha_ultima_visita=hoy))
        db.add(usuarios_models.CRMClienteNegocio(id_sucursales=sucursal_cafe_centro.id, id_usuario_consumidor=cons2.id, segmento_calculado="Frecuente", fecha_ultima_visita=hoy - timedelta(days=3)))
        db.add(usuarios_models.CRMClienteNegocio(id_sucursales=sucursal_barber_norte.id, id_usuario_consumidor=cons4.id, segmento_calculado="Nuevo", fecha_ultima_visita=hoy))
        db.add(usuarios_models.CRMClienteNegocio(id_sucursales=sucursal_spa.id, id_usuario_consumidor=cons6.id, segmento_calculado="VIP", fecha_ultima_visita=hoy - timedelta(days=7)))
        
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_cafe_centro.id, id_usuario_consumidor=cons1.id, puntuacion=5, comentario="¡El mejor café de la zona!"))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_cafe_centro.id, id_usuario_consumidor=cons2.id, puntuacion=4, comentario="Muy buen servicio, volveré pronto."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_cafe_sur.id, id_usuario_consumidor=cons3.id, puntuacion=5, comentario="Excelente atención."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_barber_norte.id, id_usuario_consumidor=cons4.id, puntuacion=5, comentario="El mejor corte que me han hecho."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_barber_centro.id, id_usuario_consumidor=cons5.id, puntuacion=4, comentario="Buen trabajo, ambiente agradable."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_spa.id, id_usuario_consumidor=cons6.id, puntuacion=5, comentario="Increíble experiencia, muy relajante."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_spa_coyoacan.id, id_usuario_consumidor=cons7.id, puntuacion=5, comentario="El mejor spa de la ciudad."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_restaurante.id, id_usuario_consumidor=cons8.id, puntuacion=4, comentario="Comida deliciosa, servicio rápido."))
        db.add(lealtad_models.ResenaSucursal(id_sucursal=sucursal_restaurante_sur.id, id_usuario_consumidor=cons9.id, puntuacion=5, comentario="Ambiente familiar, platillos exquisitos."))
        db.commit()

        print("🪙 Configurando Lealtad Global...")
        config_lealtad1 = lealtad_models.ConfiguracionLealtad(id_negocio=negocio1.id, tasa_puntos_por_peso=1.0, puntos_por_visita=1)
        config_lealtad2 = lealtad_models.ConfiguracionLealtad(id_negocio=negocio2.id, tasa_puntos_por_peso=0.5, puntos_por_visita=2)
        config_lealtad3 = lealtad_models.ConfiguracionLealtad(id_negocio=negocio3.id, tasa_puntos_por_peso=2.0, puntos_por_visita=5)
        config_lealtad5 = lealtad_models.ConfiguracionLealtad(id_negocio=negocio5.id, tasa_puntos_por_peso=1.5, puntos_por_visita=3)
        db.add_all([config_lealtad1, config_lealtad2, config_lealtad3, config_lealtad5])
        db.commit()

        db.add_all([
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad1.id, id_servicio_producto=prod_capuchino.id, multiplicador_producto=2.0),
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad1.id, id_servicio_producto=prod_latte.id, multiplicador_producto=1.5),
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad2.id, id_servicio_producto=serv_corte.id, multiplicador_producto=1.5),
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad3.id, id_servicio_producto=serv_masaje.id, multiplicador_producto=2.0),
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad3.id, id_servicio_producto=serv_facial.id, multiplicador_producto=1.8),
            lealtad_models.ConfiguracionProductoEstrella(id_configuracion_lealtad=config_lealtad5.id, id_servicio_producto=serv_comida.id, multiplicador_producto=1.8),
        ])
        db.commit()
        
        cartera1 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons1.id, id_negocio=negocio1.id, saldo_puntos=165.00, saldo_sellos=1)
        cartera2 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons2.id, id_negocio=negocio1.id, saldo_puntos=135.00, saldo_sellos=2)
        cartera3 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons3.id, id_negocio=negocio1.id, saldo_puntos=70.00, saldo_sellos=1)
        cartera4 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons4.id, id_negocio=negocio2.id, saldo_puntos=250.00, saldo_sellos=1)
        cartera5 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons5.id, id_negocio=negocio2.id, saldo_puntos=380.00, saldo_sellos=2)
        cartera6 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons6.id, id_negocio=negocio3.id, saldo_puntos=800.00, saldo_sellos=3)
        cartera7 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons7.id, id_negocio=negocio3.id, saldo_puntos=1200.00, saldo_sellos=5)
        cartera8 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons8.id, id_negocio=negocio5.id, saldo_puntos=180.00, saldo_sellos=1)
        cartera9 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons9.id, id_negocio=negocio5.id, saldo_puntos=270.00, saldo_sellos=2)
        cartera10 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons10.id, id_negocio=negocio1.id, saldo_puntos=50.00, saldo_sellos=0)
        cartera11 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons1.id, id_negocio=negocio2.id, saldo_puntos=0.00, saldo_sellos=0)
        cartera12 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons2.id, id_negocio=negocio3.id, saldo_puntos=450.00, saldo_sellos=2)
        cartera13 = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons3.id, id_negocio=negocio5.id, saldo_puntos=0.00, saldo_sellos=0)
        db.add_all([cartera1, cartera2, cartera3, cartera4, cartera5, cartera6, cartera7, cartera8, cartera9, cartera10, cartera11, cartera12, cartera13])
        db.commit()
        
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera1.id, id_transaccion=trans1.id, tipo_movimiento="acumulacion", monto_puntos=165.00, monto_sellos=1, descripcion="Acumulación por compra"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera2.id, id_transaccion=trans2.id, tipo_movimiento="acumulacion", monto_puntos=135.00, monto_sellos=2, descripcion="Acumulación por compra"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera3.id, id_transaccion=trans3.id, tipo_movimiento="acumulacion", monto_puntos=70.00, monto_sellos=1, descripcion="Acumulación por compra"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera4.id, id_transaccion=trans4.id, tipo_movimiento="acumulacion", monto_puntos=250.00, monto_sellos=1, descripcion="Acumulación por compra"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera5.id, id_transaccion=trans5.id, tipo_movimiento="acumulacion", monto_puntos=380.00, monto_sellos=2, descripcion="Acumulación por compra"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera11.id, tipo_movimiento="caducidad", monto_puntos=-50.00, monto_sellos=-1, descripcion="Puntos/sellos caducados por inactividad"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera13.id, tipo_movimiento="caducidad", monto_puntos=-25.00, monto_sellos=0, descripcion="Puntos/sellos caducados por inactividad"))
        db.commit()

        print("🎁 Creando Ofertas con Reglas N x N (Nueva estructura con tabla intermedia)...")
        oferta1 = lealtad_models.Oferta(id_sucursales=sucursal_cafe_centro.id, titulo="50% Off en Capuchino con tu Reserva", descripcion="Promo exclusiva para clientes VIP", es_publica=False, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=30), premio_en_puntos=30, premio_en_sellos=1)
        oferta2 = lealtad_models.Oferta(id_sucursales=sucursal_cafe_centro.id, titulo="2x1 en Lattes los Martes", descripcion="Todos los martes, lleva dos lattes por el precio de uno", es_publica=True, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=60), premio_en_puntos=20)
        oferta3 = lealtad_models.Oferta(id_sucursales=sucursal_cafe_sur.id, titulo="Combo Desayuno: Café + Croissant", descripcion="Café + Croissant con $20 de descuento", es_publica=True, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=45))
        oferta4 = lealtad_models.Oferta(id_sucursales=sucursal_barber_norte.id, titulo="Corte + Barba con 20% OFF", descripcion="Servicio completo con descuento", es_publica=True, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=30))
        oferta5 = lealtad_models.Oferta(id_sucursales=sucursal_barber_centro.id, titulo="3 Cortes por el precio de 2", descripcion="Compra 3 cortes y el tercero gratis", es_publica=True, estado="pausada", fecha_inicio=hoy - timedelta(days=10), fecha_fin=hoy + timedelta(days=20))
        oferta6 = lealtad_models.Oferta(id_sucursales=sucursal_spa.id, titulo="Masaje + Facial con 30% OFF", descripcion="Paquete de relajación total", es_publica=True, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=45), premio_en_puntos=100, premio_en_sellos=2)
        oferta7 = lealtad_models.Oferta(id_sucursales=sucursal_spa_coyoacan.id, titulo="Segunda visita 50% OFF", descripcion="Descuento en tu segunda visita del mes", es_publica=False, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=90))
        oferta8 = lealtad_models.Oferta(id_sucursales=sucursal_restaurante.id, titulo="Bebida gratis con platillo", descripcion="Bebida artesanal de cortesía al ordenar platillo del día", es_publica=True, estado="activa", fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=30))
        oferta9 = lealtad_models.Oferta(id_sucursales=sucursal_cafe_norte.id, titulo="Pastel Limitado", descripcion="Solo 10 pasteles disponibles a precio especial", es_publica=True, estado="activa", limite_existencias=10, fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=15))
        oferta10 = lealtad_models.Oferta(id_sucursales=sucursal_gym.id, titulo="Clase Premium por Puntos", descripcion="Canjea 500 puntos por una clase personalizada", es_publica=True, estado="activa", costo_en_puntos=500.00, fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=60), premio_en_sellos=3)
        oferta11 = lealtad_models.Oferta(id_sucursales=sucursal_restaurante_sur.id, titulo="Bienvenida Única", descripcion="Descuento exclusivo para nuevos clientes (uso único)", es_publica=True, estado="activa", limite_por_usuario=1, fecha_inicio=hoy, fecha_fin=hoy + timedelta(days=90))
        oferta12 = lealtad_models.Oferta(id_sucursales=sucursal_barber_norte.id, titulo="Oferta Eliminada", descripcion="Esta oferta fue eliminada (soft delete)", es_publica=True, estado="eliminada", fecha_inicio=hoy - timedelta(days=30), fecha_fin=hoy - timedelta(days=1))
        db.add_all([oferta1, oferta2, oferta3, oferta4, oferta5, oferta6, oferta7, oferta8, oferta9, oferta10, oferta11, oferta12])
        db.commit()
        
        # OFERTA 1: Requisito: 1 Reserva → Recompensa: 50% descuento en Capuchino
        regla1_req = lealtad_models.OfertaRegla(id_oferta=oferta1.id, tipo_regla="requisito")
        regla1_rec = lealtad_models.OfertaRegla(id_oferta=oferta1.id, tipo_regla="recompensa")
        db.add_all([regla1_req, regla1_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla1_req.id, id_servicio_disponible=disp_reserva_centro.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla1_rec.id, id_servicio_disponible=disp_cafe_centro.id, cantidad=1, porcentaje_descuento=50.00))
        
        # OFERTA 2: Requisito: 2 Lattes → Recompensa: 50% descuento en 1 Latte
        regla2_req = lealtad_models.OfertaRegla(id_oferta=oferta2.id, tipo_regla="requisito")
        regla2_rec = lealtad_models.OfertaRegla(id_oferta=oferta2.id, tipo_regla="recompensa")
        db.add_all([regla2_req, regla2_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla2_req.id, id_servicio_disponible=disp_latte_centro.id, cantidad=2))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla2_rec.id, id_servicio_disponible=disp_latte_centro.id, cantidad=1, porcentaje_descuento=50.00))
        
        # OFERTA 3: Requisito: 1 Café + 1 Croissant → Recompensa: $20 descuento
        regla3_req = lealtad_models.OfertaRegla(id_oferta=oferta3.id, tipo_regla="requisito")
        regla3_rec = lealtad_models.OfertaRegla(id_oferta=oferta3.id, tipo_regla="recompensa")
        db.add_all([regla3_req, regla3_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla3_req.id, id_servicio_disponible=disp_cafe_sur.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla3_req.id, id_servicio_disponible=disp_croissant_centro.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla3_rec.id, id_servicio_disponible=disp_cafe_sur.id, cantidad=1, monto_descuento=20.00))
        
        # OFERTA 4: Requisito: 1 Corte + 1 Barba → Recompensa: 20% descuento en total
        regla4_req = lealtad_models.OfertaRegla(id_oferta=oferta4.id, tipo_regla="requisito")
        regla4_rec = lealtad_models.OfertaRegla(id_oferta=oferta4.id, tipo_regla="recompensa")
        db.add_all([regla4_req, regla4_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla4_req.id, id_servicio_disponible=disp_corte_norte.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla4_req.id, id_servicio_disponible=disp_barba_norte.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla4_rec.id, id_servicio_disponible=disp_corte_norte.id, cantidad=1, porcentaje_descuento=20.00))
        
        # OFERTA 5: Requisito: 3 Cortes → Recompensa: 1 Corte 100% gratis
        regla5_req = lealtad_models.OfertaRegla(id_oferta=oferta5.id, tipo_regla="requisito")
        regla5_rec = lealtad_models.OfertaRegla(id_oferta=oferta5.id, tipo_regla="recompensa")
        db.add_all([regla5_req, regla5_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla5_req.id, id_servicio_disponible=disp_corte_centro_barber.id, cantidad=3))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla5_rec.id, id_servicio_disponible=disp_corte_centro_barber.id, cantidad=1, porcentaje_descuento=100.00))
        
        # OFERTA 6: Requisito: 1 Masaje + 1 Facial → Recompensa: 30% descuento en total
        regla6_req = lealtad_models.OfertaRegla(id_oferta=oferta6.id, tipo_regla="requisito")
        regla6_rec = lealtad_models.OfertaRegla(id_oferta=oferta6.id, tipo_regla="recompensa")
        db.add_all([regla6_req, regla6_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla6_req.id, id_servicio_disponible=disp_masaje_polanco.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla6_req.id, id_servicio_disponible=disp_facial_polanco.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla6_rec.id, id_servicio_disponible=disp_masaje_polanco.id, cantidad=1, porcentaje_descuento=30.00))
        
        # OFERTA 7: Requisito: 2 Masajes → Recompensa: 50% descuento en 1 Masaje
        regla7_req = lealtad_models.OfertaRegla(id_oferta=oferta7.id, tipo_regla="requisito")
        regla7_rec = lealtad_models.OfertaRegla(id_oferta=oferta7.id, tipo_regla="recompensa")
        db.add_all([regla7_req, regla7_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla7_req.id, id_servicio_disponible=disp_masaje_coyoacan.id, cantidad=2))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla7_rec.id, id_servicio_disponible=disp_masaje_coyoacan.id, cantidad=1, porcentaje_descuento=50.00))
        
        # OFERTA 8: Requisito: 1 Platillo → Recompensa: 1 Bebida 100% gratis
        regla8_req = lealtad_models.OfertaRegla(id_oferta=oferta8.id, tipo_regla="requisito")
        regla8_rec = lealtad_models.OfertaRegla(id_oferta=oferta8.id, tipo_regla="recompensa")
        db.add_all([regla8_req, regla8_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla8_req.id, id_servicio_disponible=disp_comida_rest.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla8_rec.id, id_servicio_disponible=disp_bebida_rest.id, cantidad=1, porcentaje_descuento=100.00))
        
        # OFERTA 9: Requisito: 1 Pastel con monto mínimo $100 → Recompensa: 25% descuento
        regla9_req = lealtad_models.OfertaRegla(id_oferta=oferta9.id, tipo_regla="requisito")
        regla9_rec = lealtad_models.OfertaRegla(id_oferta=oferta9.id, tipo_regla="recompensa")
        db.add_all([regla9_req, regla9_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla9_req.id, id_servicio_disponible=disp_pastel_norte.id, cantidad=1, monto_minimo=100.00))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla9_rec.id, id_servicio_disponible=disp_pastel_norte.id, cantidad=1, porcentaje_descuento=25.00))
        
        # OFERTA 10: Requisito: 1 Membresía → Recompensa: 1 Clase gratis (se compra con puntos)
        regla10_req = lealtad_models.OfertaRegla(id_oferta=oferta10.id, tipo_regla="requisito")
        regla10_rec = lealtad_models.OfertaRegla(id_oferta=oferta10.id, tipo_regla="recompensa")
        db.add_all([regla10_req, regla10_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla10_req.id, id_servicio_disponible=disp_membresia_gym.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla10_rec.id, id_servicio_disponible=disp_clase_gym.id, cantidad=1, porcentaje_descuento=100.00))
        
        # OFERTA 11: Requisito: 1 Platillo + 1 Bebida con monto mínimo $200 → Recompensa: 15% descuento
        regla11_req = lealtad_models.OfertaRegla(id_oferta=oferta11.id, tipo_regla="requisito")
        regla11_rec = lealtad_models.OfertaRegla(id_oferta=oferta11.id, tipo_regla="recompensa")
        db.add_all([regla11_req, regla11_rec])
        db.commit()
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla11_req.id, id_servicio_disponible=disp_comida_rest_sur.id, cantidad=1, monto_minimo=200.00))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla11_req.id, id_servicio_disponible=disp_bebida_rest_sur.id, cantidad=1))
        db.add(lealtad_models.OfertaReglaServicio(id_oferta_regla=regla11_rec.id, id_servicio_disponible=disp_comida_rest_sur.id, cantidad=1, monto_descuento=15.00))
        
        # OFERTA 12: Oferta eliminada (soft delete) - sin reglas
        db.commit()

        db.add(lealtad_models.OfertaWhitelist(id_oferta=oferta1.id, id_usuario_consumidor=cons1.id))
        db.add(lealtad_models.OfertaWhitelist(id_oferta=oferta1.id, id_usuario_consumidor=cons2.id))
        db.add(lealtad_models.OfertaWhitelist(id_oferta=oferta7.id, id_usuario_consumidor=cons6.id))
        db.add(lealtad_models.OfertaWhitelist(id_oferta=oferta7.id, id_usuario_consumidor=cons7.id))
        db.commit()

        db.add(lealtad_models.HistorialUsoOferta(id_oferta=oferta1.id, id_usuario_consumidor=cons1.id, id_transaccion=trans1.id, fecha_uso=datetime.utcnow()))
        db.add(lealtad_models.HistorialUsoOferta(id_oferta=oferta2.id, id_usuario_consumidor=cons2.id, id_transaccion=trans2.id, fecha_uso=datetime.utcnow()))
        db.add(lealtad_models.HistorialUsoOferta(id_oferta=oferta9.id, id_usuario_consumidor=cons3.id, id_transaccion=trans3.id, fecha_uso=datetime.utcnow()))
        db.add(lealtad_models.HistorialUsoOferta(id_oferta=oferta9.id, id_usuario_consumidor=cons4.id, id_transaccion=trans4.id, fecha_uso=datetime.utcnow()))
        db.add(lealtad_models.HistorialUsoOferta(id_oferta=oferta9.id, id_usuario_consumidor=cons5.id, id_transaccion=trans5.id, fecha_uso=datetime.utcnow()))
        db.commit()

        print("💳 Creando Transacciones con Puntos y Métodos Mixtos...")
        trans6 = finanzas_models.Transaccion(id_usuario_consumidor=cons6.id, id_sesion_caja=sesion_emp1.id, monto_total=0.00, metodo_pago="puntos", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        trans7 = finanzas_models.Transaccion(id_usuario_consumidor=cons7.id, id_sesion_caja=sesion_emp2.id, monto_total=250.00, metodo_pago="mixto", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        db.add_all([trans6, trans7])
        db.commit()
        
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera6.id, id_transaccion=trans6.id, tipo_movimiento="canje", monto_puntos=-500.00, monto_sellos=0, descripcion="Canje de puntos por Clase Premium"))
        db.add(lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera7.id, id_transaccion=trans7.id, tipo_movimiento="canje", monto_puntos=-250.00, monto_sellos=0, descripcion="Canje parcial con pago mixto"))
        db.commit()

        print("📱 Creando Feed de Publicaciones del Negocio...")
        pub1 = lealtad_models.Publicacion(id_negocio=negocio1.id, titulo="¡Cerramos el 25 de Diciembre!", descripcion="Aviso a nuestros clientes: El día 25 descansamos. Nos vemos el 26 con la mejor actitud.", habilitar_comentarios=False)
        pub2 = lealtad_models.Publicacion(id_negocio=negocio1.id, id_oferta=oferta1.id, titulo="Promoción VIP Secreta", descripcion="Porque eres un cliente frecuente, si reservas hoy una mesa, te damos tu capuchino al 50%. ¡Dale click al botón para canjear!", habilitar_comentarios=True)
        pub3 = lealtad_models.Publicacion(id_negocio=negocio1.id, id_oferta=oferta2.id, titulo="¡Martes de 2x1 en Lattes!", descripcion="Todos los martes del mes, lleva dos lattes por el precio de uno. ¡No te lo pierdas!", habilitar_comentarios=True)
        pub4 = lealtad_models.Publicacion(id_negocio=negocio2.id, titulo="Nuevo servicio: Arreglo de Barba", descripcion="Ahora ofrecemos arreglo profesional de barba. ¡Agenda tu cita hoy!", habilitar_comentarios=True)
        pub5 = lealtad_models.Publicacion(id_negocio=negocio2.id, id_oferta=oferta4.id, titulo="Combo Corte + Barba con descuento", descripcion="Aprovecha nuestro paquete completo con 20% de descuento. Válido todo el mes.", habilitar_comentarios=True)
        pub6 = lealtad_models.Publicacion(id_negocio=negocio3.id, titulo="Inauguración Spa Coyoacán", descripcion="¡Abrimos nueva sucursal! Ven a conocer nuestro spa en Coyoacán con precios especiales de inauguración.", habilitar_comentarios=True)
        pub7 = lealtad_models.Publicacion(id_negocio=negocio3.id, id_oferta=oferta6.id, titulo="Paquete de Relajación Total", descripcion="Masaje + Facial con 30% de descuento. La combinación perfecta para desconectarte del estrés.", habilitar_comentarios=True)
        pub8 = lealtad_models.Publicacion(id_negocio=negocio5.id, titulo="Nuevo menú de temporada", descripcion="Descubre nuestros nuevos platillos de temporada con ingredientes frescos y locales.", habilitar_comentarios=True)
        pub9 = lealtad_models.Publicacion(id_negocio=negocio5.id, id_oferta=oferta8.id, titulo="Bebida gratis con tu platillo", descripcion="Al ordenar cualquier platillo del día, te regalamos una bebida artesanal. ¡Salud!", habilitar_comentarios=True)
        db.add_all([pub1, pub2, pub3, pub4, pub5, pub6, pub7, pub8, pub9])
        db.commit()

        print("💬 Creando Comentarios (visibles y ocultos)...")
        com1 = lealtad_models.Comentario(id_publicacion=pub2.id, id_oferta=None, id_usuario_consumidor=cons1.id, texto_comentario="¡Excelente promo! Iré mañana mismo.", esta_oculto=False)
        com2 = lealtad_models.Comentario(id_publicacion=pub2.id, id_oferta=None, id_usuario_consumidor=cons2.id, texto_comentario="¿Aplica también para descafeinado?", esta_oculto=False)
        com3 = lealtad_models.Comentario(id_publicacion=pub2.id, id_oferta=None, id_usuario_consumidor=cons3.id, texto_comentario="Spam: Visita mi página web www.spam.com", esta_oculto=True)
        com4 = lealtad_models.Comentario(id_publicacion=pub3.id, id_oferta=None, id_usuario_consumidor=cons1.id, texto_comentario="¡Me encantan los martes de latte!", esta_oculto=False)
        com5 = lealtad_models.Comentario(id_publicacion=pub3.id, id_oferta=None, id_usuario_consumidor=cons4.id, texto_comentario="Comentario ofensivo eliminado", esta_oculto=True)
        com6 = lealtad_models.Comentario(id_publicacion=pub4.id, id_oferta=None, id_usuario_consumidor=cons4.id, texto_comentario="¿Cuánto cuesta el arreglo de barba?", esta_oculto=False)
        com7 = lealtad_models.Comentario(id_publicacion=pub4.id, id_oferta=None, id_usuario_consumidor=cons5.id, texto_comentario="Ya probé el servicio, excelente trabajo.", esta_oculto=False)
        com8 = lealtad_models.Comentario(id_publicacion=pub5.id, id_oferta=None, id_usuario_consumidor=cons4.id, texto_comentario="¡Qué buena oferta! La aprovecharé este fin de semana.", esta_oculto=False)
        com9 = lealtad_models.Comentario(id_publicacion=pub6.id, id_oferta=None, id_usuario_consumidor=cons6.id, texto_comentario="¡Felicidades por la nueva sucursal!", esta_oculto=False)
        com10 = lealtad_models.Comentario(id_publicacion=pub6.id, id_oferta=None, id_usuario_consumidor=cons7.id, texto_comentario="Ya visité Coyoacán, está increíble.", esta_oculto=False)
        com11 = lealtad_models.Comentario(id_publicacion=pub7.id, id_oferta=None, id_usuario_consumidor=cons6.id, texto_comentario="¿El descuento aplica en todas las sucursales?", esta_oculto=False)
        com12 = lealtad_models.Comentario(id_publicacion=pub8.id, id_oferta=None, id_usuario_consumidor=cons8.id, texto_comentario="Los nuevos platillos se ven deliciosos.", esta_oculto=False)
        com13 = lealtad_models.Comentario(id_publicacion=pub8.id, id_oferta=None, id_usuario_consumidor=cons9.id, texto_comentario="Publicidad engañosa: los precios no coinciden", esta_oculto=True)
        com14 = lealtad_models.Comentario(id_publicacion=pub9.id, id_oferta=None, id_usuario_consumidor=cons8.id, texto_comentario="¡Me encanta la bebida de jamaica!", esta_oculto=False)
        com15 = lealtad_models.Comentario(id_publicacion=pub9.id, id_oferta=None, id_usuario_consumidor=cons10.id, texto_comentario="¿Tienen opciones sin alcohol?", esta_oculto=False)
        
        com16 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta1.id, id_usuario_consumidor=cons1.id, texto_comentario="¿Aplica para descafeinado también?", esta_oculto=False)
        com17 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta2.id, id_usuario_consumidor=cons2.id, texto_comentario="¡Los martes son mis días favoritos!", esta_oculto=False)
        com18 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta4.id, id_usuario_consumidor=cons4.id, texto_comentario="Excelente servicio, muy profesionales.", esta_oculto=False)
        com19 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta6.id, id_usuario_consumidor=cons6.id, texto_comentario="El masaje fue increíble, muy relajante.", esta_oculto=False)
        com20 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta8.id, id_usuario_consumidor=cons8.id, texto_comentario="La bebida de cortesía estaba deliciosa.", esta_oculto=False)
        com21 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta9.id, id_usuario_consumidor=cons3.id, texto_comentario="¡Qué buen descuento en pasteles!", esta_oculto=False)
        com22 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta9.id, id_usuario_consumidor=cons5.id, texto_comentario="Solo quedan 7 pasteles, ¡aprovechen!", esta_oculto=False)
        com23 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta10.id, id_usuario_consumidor=cons6.id, texto_comentario="Canjeé mis puntos por la clase, ¡excelente!", esta_oculto=False)
        com24 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta11.id, id_usuario_consumidor=cons8.id, texto_comentario="Descuento de bienvenida muy generoso.", esta_oculto=False)
        com25 = lealtad_models.Comentario(id_publicacion=None, id_oferta=oferta11.id, id_usuario_consumidor=cons9.id, texto_comentario="¿Aplica para clientes recurrentes también?", esta_oculto=False)
        
        db.add_all([com1, com2, com3, com4, com5, com6, com7, com8, com9, com10, com11, com12, com13, com14, com15, com16, com17, com18, com19, com20, com21, com22, com23, com24, com25])
        db.commit()

        print("✅ ¡Base de datos rellenada al 100% en todos sus dominios!")

    except Exception as e:
        print(f"❌ Ocurrió un error al llenar la base de datos: {e}")
        db.rollback() 
    finally:
        db.close()