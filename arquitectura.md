# Arquitectura del Proyecto: Circle

## ⚙️ Backend (Python + FastAPI)
Arquitectura Basada en Dominios (DDD). Cada carpeta representa un área de la lógica de negocio, siendo totalmente independiente.

```text
CIRCLE/
├── backend/
│   ├── agenda/               (Dominio: Solución 1 - Agenda e Inteligencia)
│   │   ├── models.py         (Tablas: Citas, Agenda_Whitelist, Archivos_Citas, CRM)
│   │   ├── router.py         (Endpoints para gestión de citas y workspace)
│   │   └── schemas.py        (DTOs de Agenda)
│   ├── auth/                 (Dominio: Autenticación, Seguridad y JWT)
│   │   ├── router.py         (Puerta de seguridad: Recibe credenciales, verifica en BD y devuelve un "Gafete Virtual" o JWT Token)
│   │   └── schemas.py        (DTOs de Login)
│   ├── catalogo/             (Soluciones 2, 3 y 4: Inventario y Catálogo Unificado)
│   │   └── models.py         (Tablas: Productos, Servicios, Materiales, Servicios_Sucursales)
│   ├── core/                 (Configuración global, middlewares y conexión)
│   │   └── database.py       (Script de conexión a PostgreSQL)
│   ├── finanzas/             (Dominio: POS, Flujo de Efectivo y Cobros)
│   │   └── models.py         (Tablas: Transacciones, Detalle_Transaccion, Cajas_Fisicas, Sesiones_Caja, Movimientos_Efectivo)
│   ├── lealtad/              (Solución 5: Promociones Dinámicas y CRM Social)
│   │   └── models.py         (Tablas: Resenas, Ofertas, Ofertas_Reglas, Ofertas_Whitelist, Billeteras, Publicaciones, Comentarios)
│   ├── modulos/              (Dominio: Validadores de límites Gratis vs Premium y App Store Interna)
│   ├── negocios/             (Dominio: Estructura empresarial)
│   │   ├── models.py         (Tablas: Negocios, Sucursales, Empleados_Sucursal, Soluciones)
│   │   ├── router.py         (Endpoints de negocio)
│   │   └── schemas.py        (DTOs de Negocio)
│   ├── usuarios/             (Dominio: Identidad y Suscripciones Core)
│   │   ├── models.py         (Tablas: Usuarios, Suscripciones)
│   │   ├── router.py         (Endpoints /api/usuarios)
│   │   └── schemas.py        (Validaciones Pydantic)
│   ├── venv/                 (Entorno virtual aislado de dependencias Python)
│   ├── .env                  (Variables de entorno y secretos del sistema)
│   ├── datosprueba_BD.py     (Script de mantenimiento y semilla para resetear/llenar la BD)
│   ├── Dependencias.txt      (Listado de requerimientos y librerías del backend)
│   └── main.py               (Punto de entrada de FastAPI, configuración de CORS y enrutador global)

## 📱 Frontend (React Native + Expo)
Arquitectura Basada en Funcionalidades (Feature-based). Separamos la navegación visual de la lógica de negocio.

CIRCLE-MOBILE/
├── frontend/
│   ├── .expo/                    (Archivos autogenerados por Expo, no tocar)
│   ├── .vscode/                  (Configuraciones de tu editor de código)
│   ├── animations/               (Lógica matemática de animaciones complejas)
│   │   └── loginAnimation.tsx    (Animación del SVG del login)
│   ├── api/                      (Capa de comunicación con el backend)
│   │   └── apiClient.ts          (Configuración de Axios/Fetch hacia FastAPI)
│   ├── app/                      (SISTEMA DE NAVEGACIÓN - Expo Router)
│   │   ├── (auth)/               (Grupo de pantallas públicas)
│   │   │   ├── _layout.tsx       
│   │   │   └── login.tsx         
│   │   ├── (screens)/            (Grupo de pantallas de soluciones específicas)
│   │   │   ├── agenda/           
│   │   │   │   └── index.tsx     
│   │   │   └── lealtad/          
│   │   │       ├── index.tsx     
│   │   │       └── menuSoluciones.tsx 
│   │   ├── (tabs)/               (Grupo de pantallas privadas con barra inferior)
│   │   │   ├── _layout.tsx       
│   │   │   ├── config.tsx        
│   │   │   ├── home.tsx          
│   │   │   ├── _layout.tsx       (Nota: Enrutador maestro)
│   │   │   ├── index.tsx         
│   │   │   ├── sandbox.tsx       
│   │   │   └── vistaUnUI.tsx     
│   ├── assets/                   
│   │   └── images/               (Imágenes estáticas locales)
│   ├── components/               (COMPONENTES COMPUESTOS)
│   │   ├── Agenda/
│   │   │   ├── Calendario.tsx
│   │   │   ├── CrearCita.tsx
│   │   │   ├── EventoCard.tsx
│   │   │   ├── InfoConsumidor.tsx
│   │   │   └── WorkSpace.tsx
│   │   ├── Catalogo/
│   │   │   └── BannerTemp.tsx
│   │   ├── Config/
│   │   │   ├── configAdmin.tsx
│   │   │   └── configNegocio.tsx
│   │   └── Home/                 
│   │       ├── homeAdmin.tsx   
│   │       ├── homeConsumidor.tsx 
│   │       └── homeNegocio.tsx 
│   ├── constants/                
│   │   └── theme.ts              
│   ├── features/                 (LÓGICA DE NEGOCIO Y PETICIONES HTTP Puras)
│   │   ├── agenda/               
│   │   │   └── agendaService.ts  
│   │   ├── auth/                 
│   │   │   └── authService.ts    
│   │   ├── home/                 
│   │   │   └── homeService.ts    
│   │   └── soluciones/           
│   │       └── solucionesService.ts
│   ├── hooks/                    (Hooks personalizados de React)
│   │   ├── use-color-scheme.ts
│   │   ├── use-color-scheme.web.ts
│   │   └── use-theme-color.ts
│   ├── node_modules/             (Dependencias de Node instaladas)
│   ├── scripts/                  
│   │   └── reset-project.js
│   ├── store/                    (ESTADO GLOBAL)
│   │   └── useAuthStore.ts       
│   ├── ui/                       (BIBLIOTECA DE DISEÑO BASE - Átomos)
│   │   ├── BottomTabs/           
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Button/               
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── DropdownButton/       
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Fondo/                
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── Input/                
│   │   │   └── index.tsx
│   │   └── RadialMenu/           
│   │       ├── index.tsx
│   │       ├── styles.ts
│   │       ├── BuscadorUsuarios.tsx
│   │       └── Icons.tsx
│   ├── .gitignore                (Reglas de exclusión de Git)
│   ├── app.json                  (Configuración maestra de Expo)
│   ├── eslint.config.js          (Reglas de linteo de código)
│   ├── expo-env.d.ts             (Declaraciones de tipos de entorno de Expo)
│   ├── index.ts                  (Entrypoint de la aplicación)
│   ├── package-lock.json         (Árbol de dependencias bloqueado)
│   ├── package.json              (Definición de scripts y librerías)
│   ├── README.md                 (Documentación del repositorio)
│   └── tsconfig.json             (Configuración estricta de TypeScript)