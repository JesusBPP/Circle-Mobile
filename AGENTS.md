# AGENTS.md — Proyecto Circle

## Descripción del Proyecto

Circle es un ecosistema SaaS para pequeños y medianos negocios. Los dueños se registran, instalan "soluciones" modulares (Agenda, Lealtad, Inventario, etc.) y gestionan sus operaciones. Los consumidores interactúan con los negocios a través de programas de lealtad, citas y un feed social.

**Stack:**
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy + PostgreSQL (puerto 5432)
- **Frontend:** React Native (Expo SDK 54) + TypeScript + Zustand
- **Estructura monorepo:** `backend/` y `frontend/` en la raíz

## Arquitectura

### Backend — Diseño Basado en Dominios (DDD)

Cada dominio es un módulo independiente con su propio `models.py`, `router.py` y `schemas.py`:

| Dominio | Ruta | Responsabilidad |
|---|---|---|
| **Usuarios** | `backend/usuarios/` | Identidad, suscripciones, CRM |
| **Negocios** | `backend/negocios/` | Estructura empresarial, sucursales, empleados, App Store (instalación de soluciones) |
| **Auth** | `backend/auth/` | Login, generación y validación de JWT, refresh tokens |
| **Agenda** | `backend/agenda/` | Citas, agendamiento, detección de empalmes, vinculación de consumidores |
| **Catálogo** | `backend/catalogo/` | Productos, servicios, materiales, recetas (BOM), disponibilidad por sucursal |
| **Finanzas** | `backend/finanzas/` | POS, cajas, sesiones, transacciones, movimientos de efectivo |
| **Lealtad** | `backend/lealtad/` | Billeteras de lealtad, ofertas (motor de reglas NxN), feed, canje QR, reseñas |
| **Core** | `backend/core/` | Singleton de base de datos, fábrica de sesiones, configuración global |

**Punto de entrada:** `backend/main.py` — Patrón Application Factory. Los modelos se importan antes que los routers para construir el grafo de relaciones de SQLAlchemy.

**Base de datos:** `arquitectura_db.dbml` en la raíz es la fuente de verdad del esquema (33 tablas). Siempre verificar contra este archivo antes de modificar modelos.

### Frontend — Arquitectura Basada en Funcionalidades

| Capa | Ruta | Responsabilidad |
|---|---|---|
| **Rutas** | `frontend/app/` | Pantallas Expo Router: `(auth)/`, `(tabs)/`, `(screens)/` |
| **Componentes** | `frontend/components/` | Componentes de feature (Agenda, Lealtad, Home, Config, Catálogo) |
| **Servicios** | `frontend/features/` | Lógica HTTP pura (authService, agendaService, lealtadService, etc.) |
| **UI Library** | `frontend/ui/` | Átomos reutilizables: Button (5 estilos), RadialMenu, Fondo, DropdownButton, Icons |
| **Store** | `frontend/store/` | Estado global Zustand (token, datos de usuario, herramientas instaladas) |
| **API Client** | `frontend/api/apiClient.ts` | Singleton Axios con inyección automática de token vía interceptor |
| **Constantes** | `frontend/constants/theme.ts` | Tokens de color y fuentes |

**Navegación:** `RadialMenuHome` personalizado reemplaza las tab bars tradicionales. Renderizado basado en rol: admin vs. dueño de negocio (detectado si `userName` contiene "admin").

**Patrón SPA:** Los módulos de Agenda y Lealtad usan cambio de vistas por estado (master-detail) en lugar de navegación por rutas.

## Patrones y Convenciones Clave

- **Idioma:** Todo el código, variables, comentarios y texto de UI están en **español**
- **Singleton:** Conexión a base de datos (`DatabaseSingleton` en `core/database.py`)
- **Application Factory:** `crear_aplicacion()` en `main.py`
- **Service Layer:** Lealtad delega toda la lógica a `lealtad/service.py`
- **State Machine:** Transiciones de estado de Cita validadas (Programada → Reprogramada/Finalizada/Cancelada)
- **Soft Delete:** `NegocioSolucion.esta_activa`, `Comentario.esta_oculto`, `Oferta.estado='eliminada'`
- **Exclusive Arc:** `Comentario` apunta a `Publicacion` O a `Oferta`, nunca ambos
- **Vigencia de Puntos:** `verificar_vigencia_puntos()` — Caducidad automática por inactividad, resetea saldos y registra movimiento tipo 'caducidad'
- **Premios QR:** Ofertas pueden otorgar `premio_en_puntos`/`premio_en_sellos` al canjear vía QR
- **Cuotas SaaS:** Límites de suscripción validados durante instalación de soluciones
- **Pydantic v2:** Usar `ConfigDict(from_attributes=True)` para compatibilidad ORM
- **DTOs:** Los schemas siguen el patrón de herencia Base → Create/Response
- **Manejo de errores:** Frontend extrae `error.response.data.detail` de los errores de FastAPI

## Ejecución del Proyecto

### Scripts de Control

| Archivo | Propósito | Uso |
|---|---|---|
| **`EjecucionCircle.py`** | Menú interactivo para gestionar todo el ecosistema | `python EjecucionCircle.py` |
| **`backend/datosprueba_BD.py`** | Crea tablas y llena seed data con datos de prueba | Se ejecuta vía `EjecucionCircle.py` (Opciones 1 y 2) |

**`EjecucionCircle.py`** — Menú con 5 opciones:
1. **Crear/resetear BD** — Borra schema público y recrea todas las tablas (DROP SCHEMA CASCADE + CREATE SCHEMA)
2. **Llenar BD con seed data** — Inserta usuarios de prueba, negocios, sucursales, soluciones, catálogo, finanzas, agenda, lealtad. Verifica que no haya datos previos antes de insertar.
3. **Ejecutar Backend + Frontend** — Levanta uvicorn (puerto 8000) y Expo simultáneamente con limpieza de procesos zombis vía `atexit`
4. **Ejecutar solo Frontend** — Solo `npx expo start`
5. **Salir**

**`backend/datosprueba_BD.py`** — Funciones `crear_base_datos()` y `llenar_base_datos()`. Importado por `EjecucionCircle.py`. Las contraseñas del seed están hasheadas con bcrypt (`hash_password("123")`).

> **IMPORTANTE:** Después de cambios en modelos o schema, ejecutar Opción 1 (reset BD) y luego Opción 2 (seed) desde `EjecucionCircle.py`. Las contraseñas de prueba son `123` para todos los usuarios.

### Comandos Directos

```bash
# Solo Backend
backend\venv\Scripts\activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload

# Solo Frontend
cd frontend && npx expo start
```

## Reglas (OBLIGATORIAS)

### 1. Cero Suposiciones (No Hallucinations)
Bajo ninguna circunstancia debes asumir, obviar o dar por hecho la existencia de código, archivos, funciones, tablas o importaciones que no se hayan proporcionado explícitamente o que no se hayan construido juntos en el contexto inmediato. No uses frases como "Asumo que...".

### 2. Validación de Incertidumbre
Si para completar una tarea necesitas un archivo, revisar una tabla, o no tienes el 100% de certeza sobre cómo está estructurado un componente, **DETENTE**. Tu respuesta debe ser pedir el archivo o la aclaración necesaria antes de escribir una sola línea de código.

### 3. Contexto Estricto
Siempre verifica que tu solución esté alineada con la arquitectura de la base de datos (DBML) y el flujo de los componentes. Si pierdes el contexto o la memoria de la conversación se fragmenta, aplica inmediatamente la Regla 2.

### 4. Calidad Enterprise y Patrones de Diseño
Queda estrictamente prohibido el código "parche" (hacks/workarounds). Toda solución debe estar justificada bajo buenas prácticas de ingeniería de software. Emplea patrones de diseño (Repository, DTO, Facade, State, Observer, etc.) cuando aplique, asegurando que el sistema sea modular, robusto y altamente escalable.

### 5. Schema-First
Antes de modificar cualquier modelo o endpoint, siempre cruza contra `arquitectura_db.dbml` (fuente de verdad de BD) y `arquitectura.md` (referencia de estructura de archivos, puede estar desactualizada — verificar contra archivos reales).

## Paleta de Colores de Referencia

| Nombre | RGB | Uso |
|---|---|---|
| Sapphire | `rgb(15, 82, 186)` | Primario / Citas |
| Forest Green | `rgb(34, 139, 34)` | Eventos |
| Metallic Gold | `rgb(212, 175, 55)` | Completado / Finalizada |
| Matte Red | `rgb(200, 70, 70)` | Cancelado |
| Obsidian | `rgb(11, 11, 11)` | Temas oscuros |
| Cream | `rgb(255, 255, 240)` | Fondos de login |
| Cobalt Blue | `rgb(0, 71, 171)` | Brillos neomórficos |

La paleta completa con todas las tonalidades (lime, emerald, sky, tan, lavender, etc.) está documentada en `Pendientes_InfoImportante.txt`.

## Pendientes / Roadmap

### Autenticación — Implementación Completa [COMPLETADO]

**Resumen:** JWT real con HS256, bcrypt para contraseñas, refresh tokens con rotación, interceptor frontend con cola de peticiones. Verificado: 23/23 pruebas pasaron.

**Nota:** Se reemplazó `passlib` por `bcrypt` nativo en `backend/auth/security.py` por incompatibilidad con `bcrypt 5.0.0`.

### Pendientes

- [ ] Implementar `backend/modulos/` — Validadores de límites Gratis vs Premium
- [ ] Implementar `ui/Input/` — Componente de input reutilizable (actualmente inline)
- [ ] Implementar `ui/BottomTabs/` — Navegación inferior (actualmente vacío)
- [ ] Implementar `components/Home/homeConsumidor.tsx` — Home del usuario consumidor
- [ ] Migrar `arquitectura.md` a versión actualizada (está desactualizada)
- [ ] Implementar rate limiting en middlewares de `main.py`
- [ ] Revisar opción de `ignore scripts` para seguridad (npm)

### Mejora UX — Módulo Lealtad [COMPLETADO]

**Objetivo:** Mejorar la experiencia de usuario del módulo de lealtad, corrigiendo bugs críticos y haciendo la interfaz más intuitiva.

**Fases completadas:**
- **Fase 1:** Selector de Productos/Servicios — Dropdown con catálogo completo (productos + servicios)
- **Fase 2:** Corrección de Bugs — Botón pausar/activar, validación de rangos, confirmación de eliminación
- **Fase 3:** Mejoras UX — Preview de oferta, mensajes de error específicos, indicadores visuales
- **Fase 4:** Visualización de reglas NxN — Mostrar nombre de producto/servicio en requisitos y recompensas

**Cambios técnicos:**
- Nuevo endpoint: `GET /api/lealtad/negocios/{id}/catalogo-disponible` (retorna productos Y servicios)
- Schema `OfertaReglaResponse` ahora incluye `nombre_servicio_disponible` y `tipo_servicio_disponible`
- Dashboard serializa nombre y tipo de producto/servicio en reglas NxN

### Refactorización Completa — Módulo Lealtad v2 [COMPLETADO — HOY]

**Objetivo:** Refactorizar todo el dominio de Lealtad para soportar reglas NxN multi-producto, multi-sucursal, comentarios con arco exclusivo, configuración de lealtad, y seed data realista con 5 negocios.

**Backend — Modelos (`backend/lealtad/models.py`):**
- Nueva tabla `ofertas_reglas_servicios` — Tabla intermedia que conecta una regla con múltiples productos/servicios (reemplaza la FK directa `id_servicio_disponible` en `ofertas_reglas`)
- Relationships bidireccionales agregadas a todos los modelos (`back_populates`)
- Docstrings detallados en cada clase modelo
- Nuevo modelo `OfertaReglaServicio` con atributos: `cantidad`, `porcentaje_descuento`, `monto_descuento`, `monto_minimo`

**Backend — Schemas (`backend/lealtad/schemas.py`):**
- Nuevos schemas: `OfertaReglaCreate`, `OfertaReglaResponse`, `OfertaResponse`, `PublicacionResponse`, `ComentarioResponse`, `ConfiguracionLealtadResponse`, `ConfiguracionLealtadUpdate`, `ComentarioCreate`
- `OfertaCreate` ahora acepta `reglas: List[OfertaReglaCreate]` e `id_sucursales: Optional[List[int]]` (None = todas las sucursales)
- `ComentarioCreate` incluye validador `model_validator` para arco exclusivo (Publicación O Oferta)
- `OfertaResponse` incluye `nombre_sucursal`, `total_canjes`, `stock_restante`, `reglas`
- Migración de `root_validator` a `model_validator` (Pydantic v2)
- Docstrings en todos los schemas

**Backend — Router (`backend/lealtad/router.py`):**
- Nuevos endpoints:
  - `GET /negocios/{id}/catalogo-disponible` — Catálogo para reglas de ofertas
  - `GET /negocios/{id}/consumidores-afiliados` — Consumidores con cartera de lealtad
  - `GET /negocios/{id}/sucursales` — Sucursales del negocio
  - `POST /comentarios` — Crear comentario (arco exclusivo)
  - `GET /publicaciones/{id}/comentarios` — Comentarios de publicación
  - `GET /ofertas/{id}/comentarios` — Comentarios de oferta
  - `DELETE /comentarios/{id}` — Ocultar comentario (soft delete)
  - `GET /negocios/{id}/configuracion-lealtad` — Obtener reglas de lealtad
  - `PUT /negocios/{id}/configuracion-lealtad` — Actualizar reglas de lealtad
- Endpoints reorganizados por sección: Dashboard, Catálogo, Ofertas, Publicaciones, Comentarios, Configuración, QR
- `validar_acceso_negocio()` ahora se llama explícitamente en router (antes implícito en service)
- Docstrings en todos los endpoints

**Backend — Service (`backend/lealtad/service.py`):**
- Nueva función `validar_acceso_negocio()` — Verifica que usuario sea dueño o empleado del negocio
- Nueva función `obtener_catalogo_disponible_negocio()` — Retorna productos + servicios del negocio
- Nueva función `obtener_consumidores_afiliados()` — Consumidores con cartera de lealtad, ordenados alfabéticamente
- Nueva función `obtener_sucursales_negocio()` — Sucursales del negocio para selectores
- Nueva función `verificar_y_pausar_ofertas_agotadas()` — Observer pattern: pausa ofertas con stock = 0
- `crear_oferta_negocio()` ahora soporta multi-sucursal (replica oferta en N sucursales) y crea reglas NxN usando tabla intermedia `OfertaReglaServicio`
- `crear_oferta_negocio()` ahora itera sobre `regla.servicios` para crear múltiples `OfertaReglaServicio` por regla
- `obtener_dashboard_negocio()` ahora serializa múltiples servicios por regla desde tabla intermedia (lista `servicios` en cada regla)
- `obtener_dashboard_negocio()` ahora filtra ofertas con estado='eliminada' (soft delete)
- `eliminar_oferta()` ahora hace soft delete (cambia estado a 'eliminada') en lugar de hard delete
- `actualizar_oferta()` valida que no se active una oferta sin stock
- Dashboard ahora incluye reglas serializadas con lista de servicios, nombre de sucursal, total_canjes, stock_restante
- Secrets movidos a `config.py` (`QR_SECRET_KEY`, `ALGORITHM`, `QR_EXPIRATION_MINUTES`)
- Docstrings detallados en todas las funciones

**Backend — Config (`backend/lealtad/config.py`) [NUEVO ARCHIVO]:**
- Centraliza configuración de QR: `QR_SECRET_KEY`, `ALGORITHM`, `QR_EXPIRATION_MINUTES`

**Backend — Seed Data (`backend/datosprueba_BD.py`):**
- Expandido de 2 a **5 negocios**: Cafetería El Grano (Premium, 3 sucursales), Barbería Classic (Gratis, 2 sucursales), Spa Relajación Total (Premium, 2 sucursales), Gimnasio PowerFit (Gratis, 1 sucursal), Restaurante La Casa (Premium, 2 sucursales)
- **10 consumidores** de prueba (cons1–cons10) con correos realistas
- **5 dueños** (dueno1–dueno5) y **3 empleados** (emp1–emp3)
- **10 sucursales** con calificaciones y reseñas
- **15+ productos/servicios**: Capuchino, Latte, Americano, Croissant, Pastel, Corte, Barba, Masaje, Facial, Membresía, etc.
- **5 materiales**: Café, Leche, Pan, Champú, Aceite para masaje
- **5 cajas físicas** y **3 sesiones de caja** activas
- **5 transacciones** con detalles
- **4 citas** (programadas y finalizada)
- Suscripción **Premium** agregada (límites ampliados: 10 soluciones, 5 sucursales, 50 empleados, 1000 consumidores, 500 productos)
- Solución **Catálogo** agregada al App Store

**Base de datos (`arquitectura_db.dbml`):**
- Nueva tabla `Ofertas_Reglas_Servicios` con FK a `Ofertas_Reglas` y `Servicios_Disponibles`
- `monto_minimo` ahora tiene nota: "Solo para requisitos"

**Frontend — Componentes de Lealtad:**
- `FormularioOferta.tsx` — Refactorizado para soportar reglas NxN multi-producto, selector de sucursales múltiples, preview de oferta. Campos de fechas condicionados: solo se muestran si no hay límite de stock (mutual exclusivity con `limite_existencias`)
- `FormularioPublicacion.tsx` — Actualizado para vincular ofertas y manejar estado
- `WorkspaceOferta.tsx` — Dashboard mejorado con métricas de canjes, stock restante, estado de ofertas
- `WorkspacePublicacion.tsx` — Feed con comentarios y gestión de publicaciones
- `WorkspaceCalificacion.tsx` — Gestión de reseñas y calificaciones
- `OfertaCard.tsx` — Card con info de sucursal, stock, canjes. Botón de eliminar con confirmación y llamada a `lealtadService.eliminarOferta()`
- `BuscadorUsuarios.tsx` — Búsqueda de consumidores para whitelist VIP
- `lealtadService.ts` — Nuevos métodos: `obtenerCatalogoDisponible`, `obtenerConsumidoresAfiliados`, `obtenerSucursales`, `crearComentario`, `obtenerComentarios`, `ocultarComentario`, `obtenerConfiguracionLealtad`, `actualizarConfiguracionLealtad`, `eliminarOferta`

**Completado Hoy — Backend Service (Prompts 6-9):**
- `crear_oferta_negocio()` adaptado para crear múltiples `OfertaReglaServicio` por regla usando tabla intermedia
- `obtener_dashboard_negocio()` adaptado para serializar lista de servicios por regla desde tabla intermedia
- `eliminar_oferta()` cambiado de hard delete a soft delete (estado = 'eliminada')
- `obtener_dashboard_negocio()` ahora filtra ofertas con estado='eliminada'

**Completado Hoy — Frontend (Prompts 10-11):**
- `FormularioOferta.tsx` — Campos de fechas condicionados: solo visibles cuando `limiteStock` está vacío o es 0
- `OfertaCard.tsx` — Agregado botón de eliminar (ícono basura rojo) con confirmación Alert y callback `onEliminar`
- `OfertaCard.tsx` — Agregados imports de `Alert` y `lealtadService`, prop `onEliminar` en interfaz, estilo `deleteButton`

### Corrección Modelo CitaServicio — Alineación con DBML [COMPLETADO — HOY]

**Objetivo:** Corregir inconsistencia entre el modelo `CitaServicio` y la fuente de verdad (`arquitectura_db.dbml`), resolviendo el error `id_servicio_disponible is an invalid keyword argument for CitaServicio`.

**Problema:**
- El modelo usaba `id_servicio_producto` (FK a `servicios_productos`)
- El DBML y seed data usaban `id_servicio_disponible` (FK a `servicios_disponibles`) + `costo_actual`
- `datosprueba_BD.py` ya estaba actualizado pero el modelo no, causando error en ejecución

**Cambios realizados:**

**Backend — Modelos (`backend/agenda/models.py`):**
- `CitaServicio.id_servicio_producto` → `CitaServicio.id_servicio_disponible` (FK a `servicios_disponibles.id`)
- Agregado campo `costo_actual` (Numeric(10, 2), nullable=False)
- Alineación completa con DBML tabla `citas_servicios`

**Backend — Schemas (`backend/agenda/schemas.py`):**
- `CitaCreate.id_servicio_producto` → `CitaCreate.id_servicio_disponible`

**Backend — Router (`backend/agenda/router.py`):**
- `crear_cita()` ahora resuelve el costo desde `ServicioDisponible.servicio_producto.costo`
- Query a `catalogo_models.ServicioDisponible` para obtener costo del servicio
- Creación de `CitaServicio` incluye `id_servicio_disponible` + `costo_actual`
- Import de `catalogo_models` ya presente (sin cambios adicionales)

**Backend — Seed Data (`backend/datosprueba_BD.py`):**
- 4 registros de `CitaServicio` actualizados con `costo_actual` explícito:
  - Reserva Mesa VIP: $100.00
  - Corte de Cabello: $250.00
  - Masaje Relajante: $800.00
  - Capuchino Grande: $65.00

**Validación:**
- Opción 1 (reset BD) + Opción 2 (seed) ejecutadas exitosamente
- Mensaje: `✅ ¡Base de datos rellenada al 100% en todos sus dominios!`

### Sistema QR para Lealtad + Configuración Wallet + Refactor Ofertas [COMPLETADO — HOY]

**Objetivo:** Implementar el sistema completo de QR para lealtad con premios (puntos/sellos), refactorizar la configuración para soportar múltiples productos estrella, rediseñar el formulario de ofertas con dropdown buttons, y agregar pestaña "Configuración Wallet".

**Base de Datos (`arquitectura_db.dbml`):**
- `Configuracion_Lealtad` — Eliminados campos `id_producto_estrella` y `multiplicador_producto`
- Nueva tabla `Configuracion_Productos_Estrella` — Tabla intermedia con FK a `Configuracion_Lealtad` y `Servicios_Productos`, campo `multiplicador_producto`
- `Ofertas` — Agregados campos `premio_en_puntos` (decimal) y `premio_en_sellos` (int)

**Backend — Modelos (`backend/lealtad/models.py`):**
- `ConfiguracionLealtad` — Eliminados `id_producto_estrella`, `multiplicador_producto`, relationship `producto_estrella`. Agregada relationship `productos_estrella` (cascade `all, delete-orphan`)
- Nueva clase `ConfiguracionProductoEstrella` con FK a `configuracion_lealtad` y `servicios_productos`
- `Oferta` — Agregados campos `premio_en_puntos` (Numeric(10,2)) y `premio_en_sellos` (Integer)

**Backend — Modelos (`backend/catalogo/models.py`):**
- `ServicioProducto` — Eliminada relationship `configuraciones_lealtad` (ya no aplica)

**Backend — Schemas (`backend/lealtad/schemas.py`):**
- Nuevos schemas: `ProductoEstrellaCreate`, `ProductoEstrellaResponse`
- `ConfiguracionLealtadUpdate` — Eliminados `id_producto_estrella`/`multiplicador_producto`, agregado `productos_estrella: Optional[List[ProductoEstrellaCreate]]`
- `ConfiguracionLealtadResponse` — Eliminados campos viejos, agregado `productos_estrella: List[ProductoEstrellaResponse]`
- `OfertaCreate` — `fecha_inicio`/`fecha_fin` ahora opcionales, agregados `premio_en_puntos`/`premio_en_sellos`, validador actualizado (fechas solo obligatorias si no hay `limite_existencias`)
- `OfertaResponse` — Agregados `premio_en_puntos`/`premio_en_sellos`
- `OfertaReglaServicioCreate` — Validador de exclusión mutua (porcentaje O monto descuento, no ambos)
- `CanjeResponse` — Agregados `puntos_otorgados`, `sellos_otorgados`, `saldo_puntos_actual`, `saldo_sellos_actual`

**Backend — Service (`backend/lealtad/service.py`):**
- Nueva función `verificar_vigencia_puntos()` — Valida caducidad de puntos/sellos, resetea saldos y registra movimiento tipo 'caducidad'
- `canjear_qr_logic()` — Llama `verificar_vigencia_puntos` antes de procesar, crea cartera si no existe, otorga premios (puntos/sellos) después del canje, retorna saldos actualizados
- `generar_token_qr_logic()` — Llama `verificar_vigencia_puntos`, incluye `premio_en_puntos`/`premio_en_sellos` en payload JWT
- `obtener_configuracion_lealtad()` — Serializa `productos_estrella` con nombre, tipo e imagen del `ServicioProducto`
- `actualizar_configuracion_lealtad()` — Reemplazo completo de productos estrella (delete + create), valida multiplicador >= 1.0
- `crear_oferta_negocio()` — Pasa `premio_en_puntos`/`premio_en_sellos` al crear oferta
- `obtener_dashboard_negocio()` — Incluye premios en serialización, oculta fechas cuando `limite_existencias` tiene valor
- Nueva función `obtener_catalogo_productos_estrella()` — Retorna productos únicos del negocio (sin duplicados por sucursal)

**Backend — Router (`backend/lealtad/router.py`):**
- Nuevo endpoint `GET /negocios/{id}/catalogo-productos-estrella`

**Backend — Seed Data (`backend/datosprueba_BD.py`):**
- `ConfiguracionLealtad` — Eliminados `id_producto_estrella`/`multiplicador_producto` de las 4 configuraciones
- 6 registros `ConfiguracionProductoEstrella` creados: Cafetería (Capuchino x2.0, Latte x1.5), Barbería (Corte x1.5), Spa (Masaje x2.0, Facial x1.8), Restaurante (Platillo x1.8)
- Ofertas con premios: oferta1 (+30pts +1 sello), oferta2 (+20pts), oferta6 (+100pts +2 sellos), oferta10 (+3 sellos)
- 2 movimientos tipo 'caducidad' agregados como ejemplo

**Frontend — Componentes Nuevos:**
- `BuscadorCatalogo.tsx` — Búsqueda y selección múltiple de productos/servicios del catálogo con dropdown, filtrado client-side
- `CardProductoEstrella.tsx` — Card con nombre de producto, input de multiplicador editable (min 1.0), botón eliminar
- `CardReglaNxN.tsx` — Card para reglas NxN con inputs de cantidad, descuentos (exclusión mutua %/$), monto mínimo (solo requisitos)
- `ConfiguracionWallet.tsx` — Vista completa de configuración wallet: tasa puntos/peso, sellos/visita, meses vigencia, productos estrella con buscador y cards

**Frontend — Refactor:**
- `FormularioOferta.tsx` — Rediseño completo con 3 secciones colapsables exclusivas (Información básica, Productos, Configuración opcional), integración con `BuscadorCatalogo` y `CardReglaNxN`, payload con formato multi-producto, campos de premios

**Frontend — Integración:**
- `FiltrosLealtad.tsx` — Agregada pill 'Configuración' (6 pills total)
- `LealtadDashboard.tsx` — Caso 'Configuración' renderiza `ConfiguracionWallet`, import del componente
- `WorkspaceOferta.tsx` — Muestra premios al canjear, vigencia condicional (fechas o "hasta agotar existencias")
- `OfertaCard.tsx` — Interface actualizada con `premio_en_puntos`/`premio_en_sellos`, badge de premios en footer, fechas opcionales (null cuando hay limite_existencias)
- `lealtadService.ts` — Nuevo método `obtenerCatalogoProductosEstrella`, `CanjeResponseData` actualizado con campos de premios y saldos

**Bug Fix 422:**
- `OfertaCreate.fecha_inicio`/`fecha_fin` cambiados de obligatorios a opcionales
- Validador actualizado: rango de fechas solo se valida si `limite_existencias` es null
- Frontend envía `undefined` para fechas cuando hay `limite_existencias`

**Validación:**
- Backend: `from backend.main import app` — 41 routes OK
- Frontend: `npx tsc --noEmit` — Sin errores
- BD: Reset + Seed ejecutados exitosamente — `✅ ¡Base de datos rellenada al 100%!`
- Endpoint test: `GET /configuracion-lealtad` retorna productos_estrella serializados
- Endpoint test: Dashboard incluye `premio_en_puntos`/`premio_en_sellos` y oculta fechas para ofertas con `limite_existencias`

**Resumen de Archivos Modificados/Creados:**

| # | Archivo | Tipo | Descripción |
|---|---------|------|-------------|
| 1 | `arquitectura_db.dbml` | Modificar | Nueva tabla `Configuracion_Productos_Estrella`, eliminados campos de producto estrella único, agregados premios en `Ofertas` |
| 2 | `backend/lealtad/models.py` | Modificar | Nueva clase `ConfiguracionProductoEstrella`, `Oferta` con premios, eliminada relationship obsoleta |
| 3 | `backend/catalogo/models.py` | Modificar | Eliminada relationship `configuraciones_lealtad` de `ServicioProducto` |
| 4 | `backend/lealtad/schemas.py` | Modificar | Nuevos schemas `ProductoEstrellaCreate/Response`, fechas opcionales en `OfertaCreate`, validador exclusión mutua, `CanjeResponse` con premios |
| 5 | `backend/lealtad/service.py` | Modificar | Nueva función `verificar_vigencia_puntos()`, `obtener_catalogo_productos_estrella()`, canje otorga premios, config serializa productos estrella |
| 6 | `backend/lealtad/router.py` | Modificar | Nuevo endpoint `GET /negocios/{id}/catalogo-productos-estrella` |
| 7 | `backend/datosprueba_BD.py` | Modificar | 6 productos estrella, 4 ofertas con premios, 2 movimientos caducidad |
| 8 | `frontend/components/Lealtad/BuscadorCatalogo.tsx` | **NUEVO** | Componente reutilizable de búsqueda y selección múltiple de productos/servicios |
| 9 | `frontend/components/Lealtad/CardProductoEstrella.tsx` | **NUEVO** | Card con input de multiplicador editable (min 1.0) |
| 10 | `frontend/components/Lealtad/CardReglaNxN.tsx` | **NUEVO** | Card para reglas NxN con exclusión mutua de descuentos |
| 11 | `frontend/components/Lealtad/FormularioOferta.tsx` | Refactor | 3 secciones colapsables, integración con BuscadorCatalogo y CardReglaNxN |
| 12 | `frontend/components/Lealtad/ConfiguracionWallet.tsx` | **NUEVO** | Vista completa de configuración wallet con productos estrella |
| 13 | `frontend/components/Lealtad/FiltrosLealtad.tsx` | Modificar | Agregada pill 'Configuración' (6 pills total) |
| 14 | `frontend/components/Lealtad/LealtadDashboard.tsx` | Modificar | Renderiza `ConfiguracionWallet` cuando filtro activo es 'Configuración' |
| 15 | `frontend/components/Lealtad/WorkspaceOferta.tsx` | Modificar | Muestra premios, vigencia condicional |
| 16 | `frontend/components/Lealtad/OfertaCard.tsx` | Modificar | Badge de premios, fechas opcionales |
| 17 | `frontend/features/lealtad/lealtadService.ts` | Modificar | Nuevo método `obtenerCatalogoProductosEstrella`, `CanjeResponseData` actualizado |

**Total:** 13 archivos modificados + 4 archivos nuevos = 17 archivos

**Endpoints Nuevos/Modificados:**

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/api/lealtad/negocios/{id}/catalogo-productos-estrella` | Productos únicos del negocio para seleccionar como producto estrella |
| `GET` | `/api/lealtad/negocios/{id}/configuracion-lealtad` | Retorna configuración con `productos_estrella` serializados (nombre, tipo, imagen, multiplicador) |
| `PUT` | `/api/lealtad/negocios/{id}/configuracion-lealtad` | Acepta `productos_estrella: List[{id_servicio_producto, multiplicador_producto}]` |
| `POST` | `/api/lealtad/negocios/{id}/ofertas` | Acepta `premio_en_puntos` y `premio_en_sellos`, fechas opcionales si hay `limite_existencias` |
| `POST` | `/api/lealtad/ofertas/canjear-qr` | Retorna `puntos_otorgados`, `sellos_otorgados`, `saldo_puntos_actual`, `saldo_sellos_actual` |

**Cambios en Base de Datos (Tablas):**

| Tabla | Cambio |
|-------|--------|
| `Configuracion_Lealtad` | Eliminados: `id_producto_estrella`, `multiplicador_producto` |
| `Configuracion_Productos_Estrella` | **NUEVA**: `id`, `id_configuracion_lealtad` (FK), `id_servicio_producto` (FK), `multiplicador_producto` |
| `Ofertas` | Agregados: `premio_en_puntos` (decimal, nullable), `premio_en_sellos` (int, nullable) |

**Edge Cases Implementados:**

1. **Cartera inexistente al canjear QR:** Se crea automáticamente con saldos 0 antes de otorgar premios
2. **Oferta sin premios:** QR funciona normalmente sin tocar la cartera
3. **Vigencia 0 o null:** Puntos nunca caducan, no se ejecuta lógica de caducidad
4. **Producto estrella duplicado:** Frontend previene selección duplicada, backend valida
5. **Multiplicador < 1.0:** Backend rechaza con error 400
6. **Porcentaje y monto descuento simultáneos:** Backend rechaza (422), frontend aplica exclusión mutua
7. **Oferta con limite_existencias y fechas:** Backend ignora fechas (las pone en null)
8. **Canje QR con puntos caducados:** Primero resetea saldos (caducidad), luego otorga premios

## Notas Importantes

- **Cuentas de prueba:** `admin1@circle.com` (admin), `carlos@negocio.com` (dueño). Todas las contraseñas de prueba: `123`
- **Cuentas adicionales:** `dueno1@negocio.com` a `dueno5@negocio.com`, `emp1@negocio.com` a `emp3@negocio.com`, `juan@gmail.com` (cons1) a `sofia.vargas@gmail.com` (cons10)
- **Carpeta Tools/:** Contiene solo assets de diseño (mockups, paletas). Excluir del análisis de código.
- **Dimensiones de imágenes:** Relación 9:16 (vertical), 1080x1920px para slideshow de login.
- **Puerto PostgreSQL:** 5432
- **Activar venv:** `backend\venv\Scripts\activate`

## Flujo de Trabajo con Modelos de IA

El proyecto utiliza dos modelos de IA con responsabilidades diferenciadas:

### Qwen 3.7 (Modelo principal)
- **Planificación:** Diseño de arquitectura, planes de implementación complejos
- **Backend pesado:** Lógica de negocio compleja, SQL avanzado, optimización de queries
- **Seguridad:** Autenticación, autorización, manejo de tokens JWT
- **Integraciones:** APIs externas, webhooks, procesamiento asíncrono

### Qwen 3.6 (Modelo secundario)
- **Documentación:** Actualización de AGENTS.md, arquitectura.md, comentarios en código
- **Frontend:** Componentes React Native, estilos, integración con backend
- **Tareas repetitivas:** Refactoring simple, correcciones de TypeScript, ajustes de UI
- **Testing:** Escritura de tests unitarios y de integración

**Regla general:** Qwen 3.7 para decisiones arquitectónicas y código complejo. Qwen 3.6 para implementación frontend y documentación.

## Agent Skills

El proyecto utiliza **Agent Skills** instaladas en `.opencode/skills/` para mejorar la calidad del código generado. Las skills son instrucciones especializadas que se cargan bajo demanda según el contexto de la tarea.

### Skills Instaladas

| Skill | Fuente | Propósito |
|---|---|---|
| **vercel-react-native-skills** | vercel-labs/agent-skills | Performance de listas (FlashList), animaciones GPU (Reanimated), navegación nativa, Pressable, expo-image |
| **building-native-ui** | expo/skills | Guía oficial de Expo: Expo Router, NativeTabs, form sheets, safe areas, SF Symbols, haptics |
| **native-data-fetching** | expo/skills | Fetch API, React Query, manejo de auth tokens, offline support, environment variables |
| **supabase-postgres-best-practices** | supabase/agent-skills | Optimización de queries PostgreSQL, indexing, connection pooling, schema design, RLS |
| **systematic-debugging** | obra/superpowers | Metodología de debugging: root cause investigation, hypothesis testing, 4 fases |
| **improve-codebase-architecture** | mattpocock/skills | Detección de fricción arquitectónica, deepening opportunities, deep modules |
| **writing-plans** | obra/superpowers | Planes de implementación estructurados, bite-sized tasks, TDD workflow |

### Cómo Funcionan

Las skills se descubren automáticamente desde `.opencode/skills/<nombre>/SKILL.md`. Cada skill tiene:
- **Metadata** (siempre cargada): nombre y descripción para que el agente sepa cuándo usarla
- **Instrucciones** (cargadas bajo demanda): guía detallada que se inyecta al contexto cuando la tarea lo requiere
- **Referencias** (cargadas según necesidad): archivos adicionales con ejemplos y patrones

las skills aplican principios de **progressive disclosure** — solo consumen tokens del contexto cuando son relevantes para la tarea actual.

## Modelo Local (Ollama + Qwen3)

El proyecto está configurado para usar **Qwen3:8b** localmente vía Ollama, proporcionando inferencia gratuita e ilimitada para tareas de desarrollo.

### Configuración

**Archivos:**
- `opencode.json` — Configuración de OpenCode con provider Ollama
- `Modelfile` — Parámetros optimizados del modelo (contexto 64K, output 16K)

**Requisitos:**
- Ollama instalado (`winget install Ollama.Ollama`)
- Modelo base: `ollama pull qwen3:8b` (5.2GB)
- Modelo optimizado: `ollama create qwen3:8b-optimized -f Modelfile`

### Cuándo Usar Cada Modelo

| Modelo | Uso Recomendado | Costo |
|---|---|---|
| **Qwen3:8b-optimized (local)** | Edición de código diaria, bugs simples, documentación, iteración rápida | Gratis, ilimitado |
| **Qwen 3.7 Max (Go/Zen)** | Arquitectura compleja, debugging difícil, decisiones críticas | $2.50/1M input, $7.50/1M output |

### Cambiar Entre Modelos

En OpenCode, usa el comando `/models` para seleccionar:
- `Qwen3 8B Optimized (local)` — Modelo local
- `opencode-go/qwen3.7-max` — Modelo cloud

### Comandos Útiles

```bash
# Verificar que Ollama está corriendo
ollama list

# Reiniciar Ollama si falla
# Windows: Cierra Ollama del system tray y vuelve a abrirlo
# O desde terminal:
ollama serve

# Ver logs de Ollama (debugging)
# Windows: %LOCALAPPDATA%\Ollama\logs\
```

### Limitaciones del Modelo Local

- **~60-65% de la potencia** de Qwen 3.7 Max en programación
- **Contexto de 64K tokens** (vs 66K+ del cloud)
- **Mejor para:** Tareas repetitivas, boilerplate, documentación, ediciones pequeñas
- **Evitar para:** Refactorizaciones complejas, decisiones arquitectónicas críticas

### Hardware Requerido

- **GPU:** RTX 5070 (12GB VRAM) o superior
- **VRAM usada:** ~5.2GB (modelo) + ~5.5GB (contexto KV cache 64K) = ~10.7GB
- **Velocidad:** ~25-35 tokens/segundo (depende de la GPU)
