from datetime import date, datetime, timedelta
from sqlalchemy import text 
from backend.core.database import engine, Base, db_manager

# Importación de Modelos para la creación de tablas y semilla
from backend.usuarios import models as usuarios_models
from backend.negocios import models as negocios_models
from backend.agenda import models as agenda_models
from backend.catalogo import models as catalogo_models
from backend.lealtad import models as lealtad_models
from backend.finanzas import models as finanzas_models # 🌟 NUEVO DOMINIO IMPORTADO

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
        negocio1 = negocios_models.Negocio(id_dueno=dueno1.id, id_suscripcion=sub_gratis.id, nombre="Cafetería El Grano", descripcion="El mejor café colombiano.")
        negocio2 = negocios_models.Negocio(id_dueno=dueno2.id, id_suscripcion=sub_gratis.id, nombre="Barbería Classic")
        db.add_all([negocio1, negocio2])
        db.commit()

        sucursal_cafe = negocios_models.Sucursal(id_negocio=negocio1.id, nombre="Café Centro", calle="Av Hidalgo", numero_exterior="10", colonia="Centro", ciudad="CDMX", estado="CDMX", codigo_postal="10000", calificacion_promedio=4.8, total_resenas=15)
        sucursal_barber = negocios_models.Sucursal(id_negocio=negocio2.id, nombre="Barber Norte", calle="Av Reforma", numero_exterior="25", colonia="Norte", ciudad="CDMX", estado="CDMX", codigo_postal="20000")
        db.add_all([sucursal_cafe, sucursal_barber])
        db.commit()

        print("🤝 Asignando empleados...")
        es1 = negocios_models.EmpleadoSucursal(id_usuario=emp1.id, id_sucursal=sucursal_cafe.id, estado_invitacion="aceptada", permisos="solo_operacion")
        db.add(es1)
        db.commit()

        print("🛠️ Creando Catálogo de Soluciones (App Store interna)...")
        solucion_agenda = negocios_models.Solucion(nombre="Agenda", descripcion="Gestión de citas", ruta_frontend="/agenda", es_premium_exclusiva=False, activa_en_catalogo=True)
        solucion_lealtad = negocios_models.Solucion(nombre="Lealtad", descripcion="Puntos y ofertas", ruta_frontend="/lealtad", es_premium_exclusiva=False, activa_en_catalogo=True)
        db.add_all([solucion_agenda, solucion_lealtad])
        db.commit()

        print("📲 Instalando Soluciones...")
        instalacion_agenda = negocios_models.NegocioSolucion(id_negocio=negocio1.id, id_solucion=solucion_agenda.id, esta_activa=True)
        db.add(instalacion_agenda)
        db.commit()

        print("📦 Creando Catálogo Unificado y Disponibilidad...")
        mat_cafe = catalogo_models.Material(nombre="Kilo Café Colombia", costo=250.00, cantidad_existencia=10.0)
        prod_capuchino = catalogo_models.ServicioProducto(nombre="Capuchino Grande", costo=65.00, tipo_producto="producto")
        serv_reserva = catalogo_models.ServicioProducto(nombre="Reserva Mesa VIP", costo=100.00, tipo_producto="servicio")
        serv_corte = catalogo_models.ServicioProducto(nombre="Corte de Cabello", costo=250.00, tipo_producto="servicio")
        db.add_all([mat_cafe, prod_capuchino, serv_reserva, serv_corte])
        db.commit()
        
        receta_cap = catalogo_models.ProcesoServicioProducto(id_servicio_producto=prod_capuchino.id, id_material=mat_cafe.id, cantidad=0.02)
        db.add(receta_cap)
        db.commit()

        disp_cafe = catalogo_models.ServicioDisponible(id_servicio_producto=prod_capuchino.id, id_sucursal=sucursal_cafe.id)
        disp_reserva = catalogo_models.ServicioDisponible(id_servicio_producto=serv_reserva.id, id_sucursal=sucursal_cafe.id)
        disp_corte = catalogo_models.ServicioDisponible(id_servicio_producto=serv_corte.id, id_sucursal=sucursal_barber.id)
        db.add_all([disp_cafe, disp_reserva, disp_corte])
        db.commit()

        # ========================================================
        # 🌟 NUEVO: INYECCIÓN DE DATOS DE FINANZAS / CAJAS
        # ========================================================
        print("🏦 Abriendo Cajas y Sesiones de Turno...")
        caja_principal = finanzas_models.CajaFisica(id_sucursal=sucursal_cafe.id, nombre="Caja Mostrador 1", esta_activa=True)
        db.add(caja_principal)
        db.commit()

        sesion_juan = finanzas_models.SesionCaja(id_caja_fisica=caja_principal.id, id_usuario=emp1.id, fondo_inicial=500.00, fecha_apertura=datetime.utcnow())
        db.add(sesion_juan)
        db.commit()

        mov_ingreso = finanzas_models.MovimientoEfectivo(id_sesion_caja=sesion_juan.id, tipo_movimiento="ingreso", monto=100.00, concepto="Sencillo para cambio")
        db.add(mov_ingreso)
        db.commit()

        print("💳 Simulando Transacciones y Detalles...")
        # 🌟 Actualizado para usar finanzas_models
        transaccion1 = finanzas_models.Transaccion(id_usuario_consumidor=cons1.id, id_sesion_caja=sesion_juan.id, monto_total=165.00, metodo_pago="efectivo", estado_pago="completado", fecha_transaccion=datetime.utcnow())
        db.add(transaccion1)
        db.commit()
        
        detalle1 = finanzas_models.DetalleTransaccion(id_transaccion=transaccion1.id, id_servicios_productos_disponibles=disp_cafe.id, cantidad=1, subtotal=65.00)
        detalle2 = finanzas_models.DetalleTransaccion(id_transaccion=transaccion1.id, id_servicios_productos_disponibles=disp_reserva.id, cantidad=1, subtotal=100.00)
        db.add_all([detalle1, detalle2])
        db.commit()

        print("📅 Creando Citas y Agenda Whitelist...")
        hoy = datetime.utcnow()
        
        whitelist_cons1 = agenda_models.AgendaWhitelist(id_sucursales=sucursal_cafe.id, id_usuario_consumidor=cons1.id)
        db.add(whitelist_cons1)
        db.commit()

        cita_carlos = agenda_models.Cita(id_sucursal=sucursal_cafe.id, titulo="Reserva Mesa 4", fecha_hora_inicio=hoy + timedelta(days=2), fecha_hora_fin=hoy + timedelta(days=2, hours=1), numero_bloques=2, estado="programada")
        db.add(cita_carlos)
        db.commit()
        
        db.add(agenda_models.CitaServicio(id_cita=cita_carlos.id, id_servicio_producto=serv_reserva.id))
        db.add(agenda_models.CitaConsumidor(id_cita=cita_carlos.id, id_usuario_consumidor=cons1.id))
        db.add(agenda_models.ArchivoCita(id_cita=cita_carlos.id, url_archivo="https://s3/file.pdf", nombre_archivo="MenuEspecial.pdf", tipo_archivo="pdf", tamano_mb=1.5, fecha_subida=hoy))
        db.commit()

        print("📊 Creando CRM Clientes de Negocio y Reseñas...")
        crm_juan = usuarios_models.CRMClienteNegocio(id_sucursales=sucursal_cafe.id, id_usuario_consumidor=cons1.id, segmento_calculado="Leal", fecha_ultima_visita=hoy)
        resena_juan = lealtad_models.ResenaSucursal(id_sucursal=sucursal_cafe.id, id_usuario_consumidor=cons1.id, puntuacion=5, comentario="¡El mejor café!")
        db.add_all([crm_juan, resena_juan])
        db.commit()

        print("🪙 Configurando Lealtad Global...")
        config_lealtad = lealtad_models.ConfiguracionLealtad(id_negocio=negocio1.id, tasa_puntos_por_peso=1.0, puntos_por_visita=1, id_producto_estrella=prod_capuchino.id, multiplicador_producto=2.0)
        cartera_juan = lealtad_models.CarteraLealtad(id_usuario_consumidor=cons1.id, id_negocio=negocio1.id, saldo_puntos=165.00, saldo_sellos=1)
        db.add_all([config_lealtad, cartera_juan])
        db.commit()
        
        movimiento = lealtad_models.HistorialMovimientoLealtad(id_cartera=cartera_juan.id, id_transaccion=transaccion1.id, tipo_movimiento="acumulacion", monto_puntos=165.00, monto_sellos=1, descripcion="Acumulación por compra")
        db.add(movimiento)
        db.commit()

        print("🎁 Creando Reglas N x N y Canjes...")
        oferta_vip = lealtad_models.Oferta(id_sucursales=sucursal_cafe.id, titulo="50% Off en Capuchino con tu Reserva", descripcion="Promo exclusiva", es_publica=False)
        db.add(oferta_vip)
        db.commit()
        
        regla_requisito = lealtad_models.OfertaRegla(id_oferta=oferta_vip.id, tipo_regla="requisito", id_servicio_disponible=disp_reserva.id, cantidad=1)
        regla_recompensa = lealtad_models.OfertaRegla(id_oferta=oferta_vip.id, tipo_regla="recompensa", id_servicio_disponible=disp_cafe.id, porcentaje_descuento=50.00)
        db.add_all([regla_requisito, regla_recompensa])
        db.commit()

        db.add(lealtad_models.OfertaWhitelist(id_oferta=oferta_vip.id, id_usuario_consumidor=cons1.id))
        db.commit()

        # 🌟 NUEVO: Simulando que el usuario ya usó un QR
        uso_qr = lealtad_models.HistorialUsoOferta(id_oferta=oferta_vip.id, id_usuario_consumidor=cons1.id, id_transaccion=transaccion1.id, fecha_uso=datetime.utcnow())
        db.add(uso_qr)
        db.commit()

        print("📱 Creando Feed de Publicaciones del Negocio...")
        pub_aviso = lealtad_models.Publicacion(id_negocio=negocio1.id, titulo="Cerramos hoy", descripcion="Aviso.", habilitar_comentarios=False)
        pub_oferta = lealtad_models.Publicacion(id_negocio=negocio1.id, id_oferta=oferta_vip.id, titulo="Promo VIP", descripcion="Descuento", habilitar_comentarios=True)
        db.add_all([pub_aviso, pub_oferta])
        db.commit()

        comentario_juan = lealtad_models.ComentarioPublicacion(id_publicacion=pub_oferta.id, id_usuario_consumidor=cons1.id, texto_comentario="¡Excelente promo!")
        db.add(comentario_juan)
        db.commit()

        print("✅ ¡Base de datos rellenada al 100% en todos sus dominios!")

    except Exception as e:
        print(f"❌ Ocurrió un error al llenar la base de datos: {e}")
        db.rollback() 
    finally:
        db.close()