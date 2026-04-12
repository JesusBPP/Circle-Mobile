# Arquitectura del Proyecto: Circle

## ⚙️ Backend (Python + FastAPI)
Arquitectura Basada en Dominios. Cada carpeta representa un área de la lógica de negocio, siendo totalmente independiente.

```text
CIRCLE/
├── backend/
│   ├── core/                 (Configuración global, seguridad y conexión)
│   │   └── database.py       (Script de conexión a PostgreSQL)
│   ├── auth/                 (Dominio: Autenticación, JWT, Login)
│   │   ├── router.py         Este es la puerta de seguridad. Aquí se recibe un correo y contraseña, se va a buscar a la base de datos, se verifica que la 
│   │   │                          contraseña sea correcta, y si todo está bien, devuelve un "Gafete Virtual" (JWT Token).
│   │   └── schemas.py
│   ├── usuarios/             (Dominio: Core del sistema)
│   │   ├── models.py         (Tablas: Usuarios, Suscripciones)
│   │   ├── schemas.py        (Validaciones Pydantic)
│   │   └── router.py         (Endpoints /api/usuarios)
│   ├── negocios/             (Dominio: Estructura empresarial)
│   │   ├── models.py         (Tablas: Negocios, Sucursales, Empleados_Sucursal)
│   │   └── ...
│   ├── catalogo/             (Soluciones 2, 3 y 4: Inventario y Análisis)
│   │   ├── models.py         (Tablas: Productos, Servicios, Servicios_Sucursales)
│   │   └── ...
│   ├── agenda/               (Dominio: Solución 1 - Agenda e Inteligencia)
│   │   ├── models.py         (Tablas: Citas, Agenda_Whitelist, Archivos_Citas, CRM, Transacciones, Detalle_Transacciones)
│   │   └── ...
│   ├── lealtad/              (Solución 5: Promociones Dinámicas)
│   │   ├── models.py         (Tablas: Resenas, Ofertas, Ofertas_Reglas, Ofertas_Whitelist, Historial_Uso_Ofertas)
│   │   └── ...
│   ├── modulos/              (Dominio: Validadores de límites Gratis vs Premium)
│   └── main.py               (Punto de entrada y script inicializador de la BD)

Frontend (React Native + Expo)
Arquitectura Basada en Funcionalidades (Feature-based). Separamos la navegación visual de la lógica de negocio.

CIRCLE/
├── frontend/
│   ├── .expo/                    (Archivos autogenerados por Expo, no tocar)
│   ├── .vscode/                  (Configuraciones de tu editor de código)
│   ├── animations/               (Lógica matemática de animaciones complejas)
│   │   └── loginAnimation.tsx    (Animación del SVG del login)
│   ├── api/                      (Capa de comunicación con el backend)
│   │   └── apiClient.ts          (Configuración de Axios/Fetch hacia FastAPI)
│   ├── app/                      (SISTEMA DE NAVEGACIÓN - Expo Router)
│   │   ├── (auth)/               (Grupo de pantallas públicas)
│   │   │   ├── _layout.tsx       (Reglas de navegación antes del login)
│   │   │   └── login.tsx         (Pantalla visual de Login)
│   │   ├── (screens)/            (Grupo de pantallas específicas)
│   │   │   └── menuSoluciones.tsx (Pantalla menú donde podrán elegir de entre todas las soluciones)
│   │   ├── (tabs)/               (Grupo de pantallas privadas con barra inferior)
│   │   │   ├── _layout.tsx       (Configuración de la barra inferior / Bottom Tabs)
│   │   │   ├── config.tsx        (Pantalla  privada para la configuración del perfil)
│   │   │   └── home.tsx          (El "Hub" que redirigirá según el tipo de usuario)
│   │   ├── _layout.tsx           (Enrutador maestro de toda la app)
│   │   ├── index.tsx             (Punto de entrada inicial, suele redirigir al login)
│   │   ├── sandbox.tsx           (Tu patio de pruebas de la biblioteca UI)
│   │   └── vistaUnUI.tsx         (Pantalla para probar elementos UI y el entorno global)
│   ├── assets/                   (Imágenes, fuentes estáticas locales)
│   ├── components/               (COMPONENTES COMPUESTOS - Formularios, Dashboards, Tarjetas)
│   │   ├── Config/
│   │   │   ├── configNegocio.tsx
│   │   │   └── configAdmin.tsx 
│   │   └── Home/                 (Componentes para las páginas Home)
│   │       ├── homeNegocio.tsx   (Componente para la pantalla de home del negocio)
│   │       ├── homeAdmin.tsx     (Componente para la pantalla de home del admin)
│   │       └── homeConsumidor.tsx (Componente para la pantalla de home del usuario consumidor)
│   ├── constants/                (Variables globales)
│   │   └── theme.ts              (Paleta de colores general si decides extraerla)
│   ├── features/                 (LÓGICA DE NEGOCIO - Redux, Zustand, Servicios puros)
│   │   ├── auth/                 (Lógica estricta de autenticación)
│   │   │   └── authService.ts    (Funciones para validar tokens y login)
│   │   └── home/                 (Lógica para cargar los datos del dashboard)
│   │       ├── homeService.ts    (Conastruyte la petición, Oye, Backend, aquí está mi Token JWT, dime quién soy y de qué negocio soy dueño)
│   ├── hooks/                    (Hooks personalizados de React, ej. useColorScheme)
│   ├── store/
│   │   └── useAuthStore.ts       (Aquí guardaremos tu Token de seguridad y los datos del usuario para que cualquier pantalla pueda acceder a ellos al instante)
│   ├── ui/                       (BIBLIOTECA DE DISEÑO BASE - Tus átomos)
│   │   ├── Button/               (Botones Neomórficos, CleanUI, etc.)
│   │   ├── BottomTabs/           (Barra inferior de navegación)
│   │   ├── DropdownButton/       (Acordeones)
│   │   ├── Fondo/                (Fondos animados: Tech, Default, Dark)
│   │   ├── Input/                (Entradas de texto genéricas)
│   │   ├── RadialMenu/           (Tus menús circulares interactivos)
│   │   └── Icons.tsx             (Biblioteca central de vectores de Expo)
│   └── (Archivos de config)      (app.json, package.json, tsconfig.json, etc.)