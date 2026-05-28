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

**Base de datos:** `arquitectura_db.dbml` en la raíz es la fuente de verdad del esquema (32 tablas). Siempre verificar contra este archivo antes de modificar modelos.

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
- **Soft Delete:** `NegocioSolucion.esta_activa`, `Comentario.esta_oculto`
- **Exclusive Arc:** `Comentario` apunta a `Publicacion` O a `Oferta`, nunca ambos
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

## Notas Importantes

- **Cuentas de prueba:** `admin1@circle.com` (admin), `carlos@negocio.com` (dueño). Todas las contraseñas de prueba: `123`
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

El proyecto utiliza **Agent Skills** instaladas en `.agents/skills/` para mejorar la calidad del código generado. Las skills son instrucciones especializadas que se cargan bajo demanda según el contexto de la tarea.

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

Las skills se descubren automáticamente desde `.agents/skills/<nombre>/SKILL.md`. Cada skill tiene:
- **Metadata** (siempre cargada): nombre y descripción para que el agente sepa cuándo usarla
- **Instrucciones** (cargadas bajo demanda): guía detallada que se inyecta al contexto cuando la tarea lo requiere
- **Referencias** (cargadas según necesidad): archivos adicionales con ejemplos y patrones

Las skills aplican principios de **progressive disclosure** — solo consumen tokens del contexto cuando son relevantes para la tarea actual.
