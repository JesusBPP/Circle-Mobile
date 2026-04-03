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
│   ├── api/                  (Sistema de navegación de Expo Router)
│   │   ├── apiClient.ts      Su trabajo es saber exactamente a qué dirección enviar las peticiones de React Native hacia FastAPI.
│   ├── app/                  (Sistema de navegación de Expo Router)
│   │   ├── _layout.tsx       (Configuración principal de navegación)
│   │   ├── sandbox.tsx
│   │   ├── (auth)/           (Pantallas públicas)
│   │   │   └── login.tsx     (Pantalla visual de Login)
│   │   └── (tabs)/           (Pantallas privadas post-login)
│   │       └── home.tsx      (Dashboard principal dependiente del rol)
│   ├── components/           (Elementos visuales genéricos: Botones, TextInputs)
│   ├── ui/                 (Componentes básicos y reutilizables)
│   │   ├── Button/
│   │   │   ├── index.tsx   (El código del botón)
│   │   │   └── styles.ts   (Si usas StyleSheet separado)
│   │   ├── Input/
│   │   │   └── index.tsx
│   ├── animations/         (Elementos con lógica de movimiento)
│   │   └── loginAnimation.tsx
│   └── index.ts            (EL "BARRIL": Exporta todo desde aquí)
│   └── features/             (Lógica estricta de cada módulo)
│       ├── auth/             (Servicios API y lógica para iniciar sesión)
│       └── home/             (Servicios para cargar el resumen de inicio)