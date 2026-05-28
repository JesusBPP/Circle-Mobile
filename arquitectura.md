# Arquitectura del Proyecto: Circle

## Backend (Python + FastAPI)

Arquitectura Basada en Dominios (DDD). Cada carpeta representa un área de la lógica de negocio, siendo totalmente independiente.

```text
CIRCLE/
├── backend/
│   ├── agenda/                (Dominio: Solución 1 - Agenda e Inteligencia)
│   │   ├── models.py          (Tablas: Citas, Agenda_Whitelist, Archivos_Citas, Citas_Consumidores, Citas_Servicios)
│   │   ├── router.py          (Endpoints para gestión de citas, consumidores y workspace)
│   │   └── schemas.py         (DTOs de Agenda)
│   ├── auth/                  (Dominio: Autenticación, Seguridad y JWT)
│   │   ├── router.py          (Login, validación de tokens, dependencia obtener_id_desde_token)
│   │   └── schemas.py         (DTOs de Login)
│   ├── catalogo/              (Soluciones 2, 3 y 4: Inventario y Catálogo Unificado)
│   │   └── models.py          (Tablas: Materiales, Servicios_Productos, Proceso_Servicio_Producto, Servicios_Disponibles)
│   ├── core/                  (Configuración global y conexión)
│   │   └── database.py        (Singleton de conexión a PostgreSQL, fábrica de sesiones)
│   ├── finanzas/              (Dominio: POS, Flujo de Efectivo y Cobros)
│   │   └── models.py          (Tablas: Cajas_Fisicas, Sesiones_Caja, Movimientos_Efectivo, Transacciones, Detalle_Transaccion)
│   ├── lealtad/               (Solución 5: Promociones Dinámicas y CRM Social)
│   │   ├── models.py          (Tablas: Resenas, Ofertas, Ofertas_Reglas, Ofertas_Whitelist, Carteras_Lealtad, Historial_Movimientos, Publicaciones, Comentarios, Configuracion_Lealtad, Historial_Uso_Ofertas)
│   │   ├── router.py          (Endpoints de lealtad, ofertas, publicaciones, QR)
│   │   ├── schemas.py         (DTOs de Lealtad)
│   │   └── service.py         (Capa de servicio: lógica de negocio delegada del router)
│   ├── modulos/               (Dominio: Validadores de límites Gratis vs Premium — vacío, pendiente implementar)
│   ├── negocios/              (Dominio: Estructura empresarial y App Store)
│   │   ├── models.py          (Tablas: Negocios, Sucursales, Empleados_Sucursal, Soluciones, Negocios_Soluciones)
│   │   ├── router.py          (Endpoints de negocio, instalación y desinstalación de soluciones)
│   │   └── schemas.py         (DTOs de Negocio)
│   ├── usuarios/              (Dominio: Identidad y Suscripciones Core)
│   │   ├── models.py          (Tablas: Usuarios, Suscripciones, CRM_Clientes_Negocio)
│   │   ├── router.py          (Endpoints /api/usuarios, dashboard)
│   │   └── schemas.py         (Validaciones Pydantic)
│   ├── .env                   (Variables de entorno y secretos del sistema)
│   ├── datosprueba_BD.py      (Script de mantenimiento y semilla para resetear/llenar la BD)
│   ├── Dependencias.txt       (Listado de requerimientos y librerías del backend)
│   └── main.py                (Punto de entrada FastAPI, patrón Application Factory, CORS, routers)
```

## Frontend (React Native + Expo)

Arquitectura Basada en Funcionalidades (Feature-based). Separamos la navegación visual de la lógica de negocio.

```text
CIRCLE/
├── frontend/
│   ├── animations/                (Lógica matemática de animaciones complejas)
│   │   └── loginAnimation.tsx     (Slideshow crossfade del login)
│   ├── api/                       (Capa de comunicación con el backend)
│   │   └── apiClient.ts           (Singleton Axios con interceptor de token automático)
│   ├── app/                       (SISTEMA DE NAVEGACIÓN — Expo Router)
│   │   ├── _layout.tsx            (Layout raíz: Stack con ThemeProvider)
│   │   ├── index.tsx              (Redirect a login)
│   │   ├── sandbox.tsx            (Patio de pruebas)
│   │   ├── vistaUnUI.tsx          (Visor de componentes UI)
│   │   ├── (auth)/                (Grupo de pantallas públicas)
│   │   │   ├── _layout.tsx        (Layout sin header)
│   │   │   └── login.tsx          (Pantalla de login con animación y formulario)
│   │   ├── (screens)/             (Grupo de pantallas de soluciones específicas)
│   │   │   ├── menuSoluciones.tsx (Catálogo/App Store de soluciones)
│   │   │   ├── agenda/
│   │   │   │   └── index.tsx      (Orquestador master-detail de Agenda)
│   │   │   └── lealtad/
│   │   │       └── index.tsx      (Wrapper de LealtadDashboard)
│   │   └── (tabs)/                (Grupo de pantallas privadas)
│   │       ├── _layout.tsx        (Tabs con barra nativa oculta)
│   │       ├── home.tsx           (Router por rol: admin vs negocio)
│   │       └── config.tsx         (Configuración por rol: admin vs negocio)
│   ├── assets/
│   │   └── images/                (Imágenes estáticas locales)
│   ├── components/                (COMPONENTES COMPUESTOS — lógica de feature)
│   │   ├── Agenda/
│   │   │   ├── Calendario.tsx     (Widget de calendario mes/semana)
│   │   │   ├── CrearCita.tsx      (Modal de nueva cita)
│   │   │   ├── EventoCard.tsx     (Tarjeta de cita/evento en lista)
│   │   │   ├── InfoConsumidor.tsx (Modal de perfil e historial de consumidor)
│   │   │   └── WorkSpace.tsx      (Editor de cita: state machine, reprogramar, vincular)
│   │   ├── Catalogo/
│   │   │   └── BannerTemp.tsx     (Modal countdown 3-2-1 para instalación)
│   │   ├── Config/
│   │   │   ├── configAdmin.tsx    (Configuración admin — tema oscuro)
│   │   │   └── configNegocio.tsx  (Configuración negocio: herramientas, logout)
│   │   ├── Home/
│   │   │   ├── homeAdmin.tsx      (Home admin — tema oscuro, menú estático)
│   │   │   ├── homeConsumidor.tsx (Home consumidor — pendiente implementar)
│   │   │   └── homeNegocio.tsx    (Home negocio: dashboard, RadialMenu dinámico)
│   │   └── Lealtad/
│   │       ├── LealtadDashboard.tsx    (Orquestador master-detail de Lealtad)
│   │       ├── ModalCrearLealtad.tsx   (Modal: crear oferta o publicación)
│   │       ├── FormularioOferta.tsx    (Formulario de creación de oferta)
│   │       ├── FormularioPublicacion.tsx (Formulario de creación de publicación)
│   │       ├── OfertaCard.tsx          (Tarjeta de oferta en feed)
│   │       ├── PublicacionCard.tsx     (Tarjeta de publicación en feed)
│   │       ├── FiltrosLealtad.tsx      (Tabs de filtro: todo, ofertas, publicaciones)
│   │       ├── SelectorSucursales.tsx  (Selector de sucursal)
│   │       ├── MostrarQR.tsx           (Generación y canje de QR)
│   │       ├── WorkspaceOferta.tsx     (Detalle y edición de oferta)
│   │       ├── WorkspacePublicacion.tsx (Detalle y edición de publicación)
│   │       └── WorkspaceCalificacion.tsx (Workspace de reseñas y comentarios)
│   ├── constants/
│   │   └── theme.ts               (Tokens de color y fuentes)
│   ├── features/                  (LÓGICA DE NEGOCIO — peticiones HTTP puras)
│   │   ├── agenda/
│   │   │   └── agendaService.ts   (CRUD citas, servicios, consumidores, historial)
│   │   ├── auth/
│   │   │   └── authService.ts     (Login)
│   │   ├── home/
│   │   │   └── homeService.ts     (Dashboard info)
│   │   ├── lealtad/
│   │   │   └── lealtadService.ts  (Dashboard, ofertas, publicaciones, QR)
│   │   └── soluciones/
│   │       └── solucionesService.ts (Instalar, listar, desinstalar soluciones)
│   ├── hooks/                     (Hooks personalizados de React)
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   ├── scripts/
│   │   └── reset-project.js
│   ├── store/                     (ESTADO GLOBAL — Zustand)
│   │   └── useAuthStore.ts        (Token, datos de usuario, herramientas instaladas)
│   ├── ui/                        (BIBLIOTECA DE DISEÑO BASE — Átomos)
│   │   ├── BottomTabs/            (Pendiente implementar)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Button/                (5 estilos: Neo, FlatBlock, GradientArrow, CleanUI, CardSolucion)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── DropdownButton/        (Acordeón expandible: card, outline, minimal)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Fondo/                 (Fondos animados: default, dark, pattern-dark, pattern-light)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Input/                 (Pendiente implementar)
│   │   │   └── index.tsx
│   │   ├── RadialMenu/            (Menú radial animado: anillos giratorios, botones dinámicos)
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── BuscadorUsuarios.tsx   (Widget de búsqueda de consumidores)
│   │   └── Icons.tsx              (~40 iconos centralizados de múltiples librerías)
│   ├── app.json                   (Configuración maestra de Expo)
│   ├── eslint.config.js           (Reglas de linteo)
│   ├── expo-env.d.ts              (Declaraciones de tipos de entorno)
│   ├── index.ts                   (Entrypoint de la aplicación)
│   ├── package.json               (Definición de scripts y librerías)
│   ├── tsconfig.json              (Configuración estricta de TypeScript)
│   └── README.md                  (Documentación del repositorio)
```
