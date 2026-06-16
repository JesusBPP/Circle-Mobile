# Plan: Sistema QR para Lealtad + Configuración Wallet + Refactor Ofertas

**Fecha:** 15 de junio de 2026
**Estado:** Planificación
**Dominio:** `backend/lealtad/` (no se crea dominio nuevo)

---

## Objetivo

Implementar el sistema completo de QR para lealtad que:
1. Registre canjes en `Historial_Uso_Ofertas`
2. Otorgue premios (puntos/sellos) de la oferta a `Carteras_Lealtad`
3. Valide vigencia de puntos/sellos (caducidad)
4. Refactorice la `Configuracion_Lealtad` para soportar múltiples productos estrella
5. Rediseñe el formulario de ofertas con dropdown buttons y selección múltiple
6. Agregue pestaña "Configuración Wallet" al módulo de lealtad
7. Corrija el bug 422 al crear ofertas

---

## Checkpoint 1: Base de Datos — Schema y Modelos

**Objetivo:** Actualizar `arquitectura_db.dbml` y todos los modelos SQLAlchemy afectados.

### 1.1 Modificar `arquitectura_db.dbml`

**Archivo:** `arquitectura_db.dbml`

**Cambios:**

#### a) Tabla `Configuracion_Lealtad` — Eliminar campos de producto estrella
- **ELIMINAR** `id_producto_estrella` (FK a Servicios_Productos)
- **ELIMINAR** `multiplicador_producto` (decimal)
- Los demás campos permanecen igual: `tasa_puntos_por_peso`, `puntos_por_visita`, `meses_vigencia_puntos`

#### b) NUEVA Tabla `Configuracion_Productos_Estrella`
```
Table Configuracion_Productos_Estrella {
  id int [pk, increment]
  id_configuracion_lealtad int [not null, ref: > Configuracion_Lealtad.id]
  id_servicio_producto int [not null, ref: > Servicios_Productos.id]
  multiplicador_producto decimal [not null, default: 1.0, note: "Ej: 2.0 = Puntos dobles"]
}
```

#### c) Tabla `Ofertas` — Agregar 2 nuevos campos
- **AGREGAR** `premio_en_puntos decimal [default: null, note: "Puntos que se otorgan al canjear la oferta via QR"]`
- **AGREGAR** `premio_en_sellos int [default: null, note: "Sellos que se otorgan al canjear la oferta via QR"]`

### 1.2 Modificar `backend/lealtad/models.py`

**Archivo:** `backend/lealtad/models.py`

#### a) Clase `ConfiguracionLealtad`
- **ELIMINAR** campo `id_producto_estrella`
- **ELIMINAR** campo `multiplicador_producto`
- **ELIMINAR** relationship `producto_estrella`
- **AGREGAR** relationship `productos_estrella` -> `ConfiguracionProductoEstrella` (cascade `all, delete-orphan`)

#### b) NUEVA Clase `ConfiguracionProductoEstrella`
```python
class ConfiguracionProductoEstrella(Base):
    __tablename__ = "configuracion_productos_estrella"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_configuracion_lealtad = Column(Integer, ForeignKey("configuracion_lealtad.id"), nullable=False)
    id_servicio_producto = Column(Integer, ForeignKey("servicios_productos.id"), nullable=False)
    multiplicador_producto = Column(Numeric(5, 2), default=1.0, nullable=False)

    configuracion = relationship("ConfiguracionLealtad", back_populates="productos_estrella")
    servicio_producto = relationship("ServicioProducto")
```

#### c) Clase `Oferta`
- **AGREGAR** campo `premio_en_puntos = Column(Numeric(10, 2), nullable=True)`
- **AGREGAR** campo `premio_en_sellos = Column(Integer, nullable=True)`

### 1.3 Modificar `backend/catalogo/models.py`

**Archivo:** `backend/catalogo/models.py`

#### a) Clase `ServicioProducto`
- **ELIMINAR** relationship `configuraciones_lealtad` (ya no aplica, ahora va por tabla intermedia)

### 1.4 Validación Checkpoint 1

**Test:**
```bash
# Reset BD + seed
python EjecucionCircle.py  # Opción 1 (reset) + Opción 2 (seed)
```
**Esperado:** Tablas creadas sin errores. `configuracion_productos_estrella` existe. `ofertas` tiene `premio_en_puntos` y `premio_en_sellos`.

---

## Checkpoint 2: Backend Schemas — DTOs Actualizados

**Objetivo:** Actualizar todos los schemas Pydantic para reflejar los cambios de BD y soportar la nueva lógica.

**Archivo:** `backend/lealtad/schemas.py`

### 2.1 Schemas de Configuracion Lealtad

#### a) NUEVO `ProductoEstrellaCreate`
```python
class ProductoEstrellaCreate(BaseModel):
    id_servicio_producto: int
    multiplicador_producto: float = 1.0
```

#### b) NUEVO `ProductoEstrellaResponse`
```python
class ProductoEstrellaResponse(BaseModel):
    id: int
    id_servicio_producto: int
    nombre_servicio: Optional[str] = None
    tipo_servicio: Optional[str] = None
    url_imagen: Optional[str] = None
    multiplicador_producto: float
    model_config = ConfigDict(from_attributes=True)
```

#### c) MODIFICAR `ConfiguracionLealtadUpdate`
- **ELIMINAR** `id_producto_estrella` y `multiplicador_producto`
- **AGREGAR** `productos_estrella: Optional[List[ProductoEstrellaCreate]] = None`

#### d) MODIFICAR `ConfiguracionLealtadResponse`
- **ELIMINAR** `id_producto_estrella` y `multiplicador_producto`
- **AGREGAR** `productos_estrella: List[ProductoEstrellaResponse] = []`

### 2.2 Schemas de Ofertas

#### a) MODIFICAR `OfertaCreate`
- **AGREGAR** `premio_en_puntos: Optional[float] = None`
- **AGREGAR** `premio_en_sellos: Optional[int] = None`
- **MODIFICAR** validador `validar_reglas_oferta`:
  - Si `limite_existencias` tiene valor, `fecha_inicio` y `fecha_fin` son opcionales (no validar rango)
  - Si `limite_existencias` es null, validar `fecha_fin > fecha_inicio`

#### b) MODIFICAR `OfertaResponse`
- **AGREGAR** `premio_en_puntos: Optional[float] = None`
- **AGREGAR** `premio_en_sellos: Optional[int] = None`

#### c) MODIFICAR `OfertaReglaServicioCreate`
- **AGREGAR** validador: si `porcentaje_descuento` tiene valor, `monto_descuento` debe ser None y viceversa

### 2.3 Schemas QR

#### a) MODIFICAR `CanjeResponse`
- **AGREGAR** `puntos_otorgados: Optional[float] = None`
- **AGREGAR** `sellos_otorgados: Optional[int] = None`
- **AGREGAR** `saldo_puntos_actual: float`
- **AGREGAR** `saldo_sellos_actual: int`

### 2.4 Validación Checkpoint 2

**Test:**
```bash
# Activar venv y verificar imports
backend\venv\Scripts\activate
python -c "from backend.lealtad.schemas import *; print('Schemas OK')"
```
**Esperado:** Sin errores de importación ni validación.

---

## Checkpoint 3: Backend Service — Lógica de Negocio

**Objetivo:** Implementar toda la lógica nueva: vigencia de puntos, premios QR, productos estrella múltiples, y corrección de bugs.

**Archivo:** `backend/lealtad/service.py`

### 3.1 NUEVA Función `verificar_vigencia_puntos`

```
Firma: (db: Session, cartera: CarteraLealtad) -> bool
```

**Lógica:**
1. Obtener `ConfiguracionLealtad` del negocio de la cartera
2. Si `meses_vigencia_puntos` es 0 o None → retornar True (sin caducidad)
3. Calcular: `meses_transcurridos = (datetime.utcnow() - cartera.fecha_ultima_acumulacion).days / 30.44`
4. Si `meses_transcurridos > meses_vigencia_puntos`:
   - Crear `HistorialMovimientoLealtad` con `tipo_movimiento='caducidad'`, `monto_puntos=-cartera.saldo_puntos`, `monto_sellos=-cartera.saldo_sellos`, `descripcion='Puntos/sellos caducados por inactividad'`
   - Resetear `cartera.saldo_puntos = 0`, `cartera.saldo_sellos = 0`
   - Commit
   - Retornar False (caducaron)
5. Retornar True (vigentes)

**Dónde se llama:** Al inicio de `canjear_qr_logic` (antes de otorgar premios) y en `obtener_dashboard_negocio` (para mostrar saldos actualizados).

### 3.2 MODIFICAR Función `canjear_qr_logic`

**Cambios al flujo existente:**

Después del paso actual de crear `HistorialUsoOferta` (paso 8 del flujo actual), AGREGAR:

```
9. Otorgar premios de la oferta:
   a. Si oferta.premio_en_puntos tiene valor:
      - cartera.saldo_puntos += oferta.premio_en_puntos
      - Crear HistorialMovimientoLealtad(tipo='acumulacion', monto_puntos=premio_en_puntos, descripcion='Premio por canje de oferta: {titulo}')
   b. Si oferta.premio_en_sellos tiene valor:
      - cartera.saldo_sellos += oferta.premio_en_sellos
      - Crear HistorialMovimientoLealtad(tipo='acumulacion', monto_sellos=premio_en_sellos, descripcion='Premio por canje de oferta: {titulo}')
   c. Actualizar cartera.fecha_ultima_acumulacion = datetime.utcnow()
   d. Commit

10. Retornar CanjeResponse con puntos_otorgados, sellos_otorgados, saldo_puntos_actual, saldo_sellos_actual
```

**IMPORTANTE:** Antes de otorgar premios, llamar `verificar_vigencia_puntos(db, cartera)` para validar/resetea saldos caducados.

**Nota sobre la cartera:** Si el consumidor no tiene cartera para este negocio, crearla automáticamente (saldo 0) antes de otorgar premios.

### 3.3 MODIFICAR Función `generar_token_qr_logic`

**Cambios:**
- Agregar llamada a `verificar_vigencia_puntos` antes de generar el token (para que el consumidor vea su saldo real)
- Incluir en el payload JWT: `premio_en_puntos` y `premio_en_sellos` de la oferta

### 3.4 MODIFICAR Función `obtener_configuracion_lealtad`

**Cambios:**
- Al obtener la configuración, serializar también los `productos_estrella` con nombre, tipo e imagen del `ServicioProducto`
- Si no existe configuración, auto-crearla con defaults (como ya hace) pero SIN productos estrella

### 3.5 MODIFICAR Función `actualizar_configuracion_lealtad`

**Cambios:**
- Si `productos_estrella` viene en el payload:
  1. Eliminar todos los `ConfiguracionProductoEstrella` existentes para esta configuración
  2. Crear nuevos registros desde la lista del payload
- Commit

### 3.6 MODIFICAR Función `crear_oferta_negocio`

**Cambios:**
- Pasar `premio_en_puntos` y `premio_en_sellos` al crear la `Oferta`
- **BUG FIX 422:** Investigar la causa raíz del error 422. Posibles causas:
  - El schema `OfertaCreate` requiere `fecha_inicio` y `fecha_fin` como obligatorios, pero el frontend no los envía cuando hay `limite_existencias`
  - Hacer `fecha_inicio` y `fecha_fin` opcionales en el schema cuando `limite_existencias` tiene valor
  - Verificar que el payload del frontend coincida con los campos del schema

### 3.7 MODIFICAR Función `obtener_dashboard_negocio`

**Cambios:**
- Llamar `verificar_vigencia_puntos` para cada cartera del negocio (actualizar saldos caducados)
- En la serialización de ofertas, incluir `premio_en_puntos` y `premio_en_sellos`
- **Lógica de visualización:** Si la oferta tiene `limite_existencias` con valor, NO mostrar `fecha_inicio` ni `fecha_fin` en la respuesta (ponerlos en None)

### 3.8 Validación Checkpoint 3

**Test:**
```bash
# Reset BD + seed + arrancar backend
python EjecucionCircle.py  # Opción 1 + Opción 2 + Opción 3
```

**Tests manuales con curl/httpie:**
```bash
# 1. Obtener configuración lealtad (debe incluir productos_estrella vacío o con datos)
GET /api/lealtad/negocios/1/configuracion-lealtad

# 2. Actualizar configuración con productos estrella
PUT /api/lealtad/negocios/1/configuracion-lealtad
Body: { "productos_estrella": [{"id_servicio_producto": 1, "multiplicador_producto": 2.0}] }

# 3. Crear oferta con premios
POST /api/lealtad/negocios/1/ofertas
Body: { "titulo": "Test", "es_publica": true, "reglas": [...], "premio_en_puntos": 50, "premio_en_sellos": 1 }

# 4. Generar token QR
GET /api/lealtad/ofertas/1/generar-token-qr

# 5. Canjear QR (otorga premios)
POST /api/lealtad/ofertas/canjear-qr
Body: { "token_qr": "...", "id_transaccion": 1 }
```

**Esperado:** Todos los endpoints retornan 200/201. El canje QR otorga puntos/sellos y los refleja en la respuesta.

---

## Checkpoint 4: Backend Router — Endpoints

**Objetivo:** Ajustar endpoints existentes y agregar los necesarios para productos estrella.

**Archivo:** `backend/lealtad/router.py`

### 4.1 MODIFICAR Endpoint `actualizar_configuracion_lealtad`

- Ya existe `PUT /negocios/{id_negocio}/configuracion-lealtad`
- El schema actualizado (`ConfiguracionLealtadUpdate`) ahora acepta `productos_estrella`
- No se requiere cambio en el router, solo asegurarse de que el schema se propague correctamente al service

### 4.2 MODIFICAR Endpoint `obtener_configuracion_lealtad`

- Ya existe `GET /negocios/{id_negocio}/configuracion-lealtad`
- El response model actualizado (`ConfiguracionLealtadResponse`) ahora incluye `productos_estrella`
- Agregar `response_model=ConfiguracionLealtadResponse` si no lo tiene

### 4.3 NUEVO Endpoint `obtener_catalogo_productos_estrella`

```
GET /negocios/{id_negocio}/catalogo-productos-estrella
```

**Propósito:** Retornar todos los productos y servicios del negocio disponibles para seleccionar como producto estrella. Similar a `catalogo-disponible` pero retorna `ServicioProducto` (no `ServicioDisponible`).

**Lógica:** Reutilizar `obtener_catalogo_disponible_negocio` o crear variante que retorne productos únicos (sin duplicados por sucursal).

### 4.4 MODIFICAR Endpoint `crear_oferta`

- Agregar manejo de `premio_en_puntos` y `premio_en_sellos` en el payload
- **BUG FIX:** Asegurar que el schema `OfertaCreate` acepte `fecha_inicio` y `fecha_fin` como opcionales cuando `limite_existencias` tiene valor

### 4.5 Validación Checkpoint 4

**Test:**
```bash
# Verificar que todos los endpoints responden correctamente
# Probar el bug fix: crear oferta con limite_existencias y sin fechas
POST /api/lealtad/negocios/1/ofertas
Body: { "titulo": "Sin fechas", "es_publica": true, "limite_existencias": 10, "reglas": [...] }
```

**Esperado:** 201 Created (no 422).

---

## Checkpoint 5: Seed Data — Actualizar `datosprueba_BD.py`

**Objetivo:** Adaptar el seed data a los nuevos modelos y agregar datos para productos estrella y premios.

**Archivo:** `backend/datosprueba_BD.py`

### 5.1 Actualizar ConfiguracionLealtad

- Eliminar `id_producto_estrella` y `multiplicador_producto` de las 4 configuraciones existentes
- Después de crear cada configuración, crear registros `ConfiguracionProductoEstrella`:
  - config1 (Cafetería): Capuchino Grande (x2.0), Latte (x1.5)
  - config2 (Barbería): Corte de Cabello (x1.5)
  - config3 (Spa): Masaje Relajante (x2.0), Facial (x1.8)
  - config5 (Restaurante): Platillo del Día (x1.8)

### 5.2 Actualizar Ofertas

- Agregar `premio_en_puntos` y `premio_en_sellos` a ofertas seleccionadas:
  - oferta1 (50% Capuchino VIP): `premio_en_puntos=30`, `premio_en_sellos=1`
  - oferta2 (2x1 Lattes): `premio_en_puntos=20`
  - oferta6 (Masaje+Facial): `premio_en_puntos=100`, `premio_en_sellos=2`
  - oferta10 (Clase Premium por Puntos): `premio_en_sellos=3`

### 5.3 Agregar HistorialMovimientoLealtad de caducidad (ejemplo)

- Crear 1-2 movimientos tipo `caducidad` para demostrar la funcionalidad

### 5.4 Validación Checkpoint 5

**Test:**
```bash
python EjecucionCircle.py  # Opción 1 (reset) + Opción 2 (seed)
```

**Esperado:** `✅ ¡Base de datos rellenada al 100% en todos sus dominios!`

---

## Checkpoint 6: Frontend — Componente BuscadorCatálogo (Reutilizable)

**Objetivo:** Crear un componente reutilizable de búsqueda y selección múltiple de productos/servicios del catálogo.

**Archivo NUEVO:** `frontend/components/Lealtad/BuscadorCatalogo.tsx`

### 6.1 Props del Componente

```typescript
interface BuscadorCatalogoProps {
  idNegocio: number
  seleccionados: ProductoCatalogo[]
  onSeleccionChange: (productos: ProductoCatalogo[]) => void
  maxVisible?: number  // Default: 4
  placeholder?: string
}

interface ProductoCatalogo {
  id: number
  nombre: string
  costo: number
  tipo_producto: string
  url_imagen?: string
}
```

### 6.2 Funcionalidad

- Input de búsqueda con filtrado en tiempo real (client-side)
- Lista scrollable debajo del input, máximo `maxVisible` items visibles a la vez
- Cada item muestra: nombre, tipo (producto/servicio), costo
- Tap en item → toggle selección (agregar/quitar)
- Items seleccionados se muestran con check icon
- Soporte para selección múltiple

### 6.3 Datos

- Carga catálogo via `lealtadService.obtenerServiciosDisponibles(idNegocio)` al montar
- Filtrado client-side por `nombre` (case-insensitive)

### 6.4 Validación Checkpoint 6

**Test:** Verificar que el componente se renderiza, busca y selecciona correctamente (se validará visualmente al integrarse en los formularios).

---

## Checkpoint 7: Frontend — Componente CardProductoEstrella (Reutilizable)

**Objetivo:** Crear el card que muestra un producto estrella seleccionado con su multiplicador editable.

**Archivo NUEVO:** `frontend/components/Lealtad/CardProductoEstrella.tsx`

### 7.1 Props

```typescript
interface CardProductoEstrellaProps {
  producto: ProductoCatalogo
  multiplicador: number
  onMultiplicadorChange: (valor: number) => void
  onEliminar: () => void
}
```

### 7.2 Layout del Card

```
┌─────────────────────────────────────┐
│ Nombre del Producto/Servicio        │
│ ┌──────┐                            │
│ │ Icon │  Multiplicador: [Input]    │
│ └──────┘                            │
│                          [X eliminar]│
└─────────────────────────────────────┘
```

### 7.3 Validación Checkpoint 7

**Test:** Renderizado visual correcto (se valida al integrar).

---

## Checkpoint 8: Frontend — CardReglaNxN (Refactor)

**Objetivo:** Crear el card para mostrar productos/servicios seleccionados en reglas NxN con inputs de cantidad, descuentos.

**Archivo NUEVO:** `frontend/components/Lealtad/CardReglaNxN.tsx`

### 8.1 Props

```typescript
interface CardReglaNxNProps {
  producto: ProductoCatalogo
  cantidad: number
  porcentajeDescuento: number | null
  montoDescuento: number | null
  montoMinimo: number | null  // Solo para requisitos
  esRequisito: boolean
  onCantidadChange: (valor: number) => void
  onPorcentajeChange: (valor: number | null) => void
  onMontoDescuentoChange: (valor: number | null) => void
  onMontoMinimoChange: (valor: number | null) => void
  onEliminar: () => void
}
```

### 8.2 Layout del Card

```
┌─────────────────────────────────────┐
│ Nombre del Producto/Servicio        │
│ ┌──────┐  Cantidad: [1]             │
│ │ Icon │  % Desc: [___]  ó          │
│ └──────┘  $ Desc: [___]             │
│            $ Mín: [___] (solo req.) │
│                          [X eliminar]│
└─────────────────────────────────────┘
```

### 8.3 Lógica de Exclusión Mutua

- Si el usuario escribe en `% Descuento` → borrar `$ Descuento` (set null)
- Si el usuario escribe en `$ Descuento` → borrar `% Descuento` (set null)
- Validar rango de `% Descuento`: 1-100

### 8.4 Defaults

- `cantidad` default: 1
- `porcentajeDescuento` default: null
- `montoDescuento` default: null
- `montoMinimo` default: null

### 8.5 Validación Checkpoint 8

**Test:** Renderizado + exclusión mutua funciona (se valida al integrar).

---

## Checkpoint 9: Frontend — Refactor FormularioOferta.tsx

**Objetivo:** Rediseñar completamente el formulario de creación de ofertas usando dropdown buttons.

**Archivo:** `frontend/components/Lealtad/FormularioOferta.tsx`

### 9.1 Estructura de Dropdown Buttons

El formulario se organiza en 3 secciones colapsables (solo una abierta a la vez):

#### Dropdown 1: "Información básica" (abierto por default)
- Input `Título`
- Input `Descripción` (opcional)
- Botón switch: `Oferta pública` ↔ `Oferta VIP`
  - **Modo pública con limite_existencias:** Mostrar input `Existencias máx`
  - **Modo pública sin limite_existencias:** Mostrar datepickers `Válida desde` y `Válida hasta`
  - **Modo VIP:** Mostrar `BuscadorUsuarios` + chip tray de usuarios seleccionados
  - El switch entre "fechas" y "existencias" funciona así: si se llena `Existencias máx`, se ocultan las fechas. Si se borra `Existencias máx`, aparecen las fechas.

#### Dropdown 2: "Productos" (cerrado por default)
- Sección **Requisito:**
  - `BuscadorCatalogo` para seleccionar productos/servicio (múltiple)
  - Por cada producto seleccionado → renderizar `CardReglaNxN` con `esRequisito=true`
- Sección **Recompensa:**
  - `BuscadorCatalogo` para seleccionar productos/servicio (múltiple)
  - Por cada producto seleccionado → renderizar `CardReglaNxN` con `esRequisito=false`
- Botón "Agregar regla" para añadir más requisitos o recompensas

#### Dropdown 3: "Configuración opcional" (cerrado por default)
- Switch `es_publica` (con BuscadorUsuarios si es VIP — mover aquí si es VIP)
- Input `Costo (Puntos)` — costo para el consumidor
- Input `Límite de canjes por usuario`
- Selector de sucursales (multi-select, si hay más de 1)
- **NUEVO:** Input `Premio en puntos` (debajo de límite canjes)
- **NUEVO:** Input `Premio en sellos` (debajo de premio en puntos)
- Nota informativa: "Ambos pueden estar vacíos (sin premio) o tener valor (se otorgan al canjear)"

### 9.2 Lógica de Dropdown Exclusivo

- Al abrir un dropdown → cerrar los demás
- Estado: `dropdownActivo: 'basica' | 'productos' | 'config' | null`

### 9.3 Construcción del Payload

```typescript
const payload = {
  titulo,
  descripcion: descripcion || undefined,
  fecha_inicio: limiteExistencias ? undefined : fechaInicio,
  fecha_fin: limiteExistencias ? undefined : fechaFin,
  limite_existencias: limiteExistencias ? parseInt(limiteExistencias) : undefined,
  limite_por_usuario: limitePorUsuario ? parseInt(limitePorUsuario) : undefined,
  es_publica: esPublica,
  costo_en_puntos: costoEnPuntos ? parseFloat(costoEnPuntos) : undefined,
  premio_en_puntos: premioEnPuntos ? parseFloat(premioEnPuntos) : undefined,
  premio_en_sellos: premioEnSellos ? parseInt(premioEnSellos) : undefined,
  whitelist_ids: esPublica ? [] : usuariosWhitelist.map(u => u.id),
  id_sucursales: seleccionarTodas ? null : [sucursalSeleccionada],
  reglas: [
    ...reglasRequisito.map(r => ({
      tipo_regla: 'requisito',
      servicios: r.productos.map(p => ({
        id_servicio_disponible: p.id,
        cantidad: p.cantidad,
        monto_minimo: p.montoMinimo
      }))
    })),
    ...reglasRecompensa.map(r => ({
      tipo_regla: 'recompensa',
      servicios: r.productos.map(p => ({
        id_servicio_disponible: p.id,
        cantidad: p.cantidad,
        porcentaje_descuento: p.porcentajeDescuento,
        monto_descuento: p.montoDescuento
      }))
    }))
  ]
}
```

### 9.4 Validación Checkpoint 9

**Test:**
1. Abrir modal "Nueva Oferta" → dropdown "Información básica" abierto
2. Llenar título → cambiar a VIP → buscar usuarios
3. Abrir "Productos" → buscar y seleccionar múltiples → ver cards con inputs
5. Abrir "Configuración opcional" → llenar premios
6. Guardar → verificar que NO da error 422
7. Verificar en BD que la oferta se creó con todos los campos

---

## Checkpoint 10: Frontend — Componente ConfiguracionWallet.tsx

**Objetivo:** Crear la vista de configuración de wallet de lealtad.

**Archivo NUEVO:** `frontend/components/Lealtad/ConfiguracionWallet.tsx`

### 10.1 Layout

```
┌─────────────────────────────────────────┐
│ ⚙️ Configuración Wallet                  │
├─────────────────────────────────────────┤
│                                          │
│  1$ = [Input] puntos                    │
│  (tasa_puntos_por_peso)                 │
│                                          │
│  1 visita = [Input] sellos              │
│  (puntos_por_visita)                    │
│                                          │
│  Meses de vida de los puntos/sellos:    │
│  [Input]                                │
│  (meses_vigencia_puntos)                │
│                                          │
│  Productos Estrella:                    │
│  [DropdownButton ▼]                     │
│    ┌──────────────────────────┐         │
│    │ 🔍 Buscar producto...    │         │
│    │ ─ Capuchino Grande $65   │         │
│    │ ─ Latte $55              │         │
│    │ ─ Croissant $45          │         │
│    │ ─ Pastel $80             │         │
│    │ (scroll para más...)     │         │
│    └──────────────────────────┘         │
│                                          │
│  ┌──────────────────────────────┐       │
│  │ Capuchino Grande              │       │
│  │ ☕  Multiplicador: [2.0]      │       │
│  └──────────────────────────────┘       │
│  ┌──────────────────────────────┐       │
│  │ Latte                         │       │
│  │ ☕  Multiplicador: [1.5]      │       │
│  └──────────────────────────────┘       │
│                                          │
│         [Guardar Configuración]          │
└─────────────────────────────────────────┘
```

### 10.2 Props

```typescript
interface ConfiguracionWalletProps {
  idNegocio: number
}
```

### 10.3 Lógica

1. **On mount:** Llamar `lealtadService.obtenerConfiguracionLealtad(idNegocio)` para cargar datos existentes
2. **On mount:** Cargar catálogo via `lealtadService.obtenerServiciosDisponibles(idNegocio)` para el buscador
3. **Estado local:**
   - `tasaPuntosPorPeso: string`
   - `puntosPorVisita: string`
   - `mesesVigencia: string`
   - `productosEstrella: Array<{ id_servicio_producto, nombre, tipo_producto, url_imagen, multiplicador }>`
4. **Dropdown de productos estrella:**
   - Al hacer clic → mostrar `BuscadorCatalogo` embebido
   - Al seleccionar un producto → agregarlo a la lista de productos estrella con multiplicador default 1.0
   - No permitir duplicados
5. **Cards de productos estrella:**
   - Usar `CardProductoEstrella` por cada producto seleccionado
   - Input de multiplicador editable (numeric, min 1.0)
6. **Guardar:**
   - Construir payload: `{ tasa_puntos_por_peso, puntos_por_visita, meses_vigencia_puntos, productos_estrella: [...] }`
   - Llamar `lealtadService.actualizarConfiguracionLealtad(idNegocio, payload)`
   - Mostrar toast/alert de éxito

### 10.4 Validación Checkpoint 10

**Test:**
1. Navegar a Lealtad → filtro "Configuración" → ver formulario
2. Modificar tasa, visitas, vigencia
3. Buscar y seleccionar productos estrella
4. Ajustar multiplicadores
5. Guardar → verificar 200 OK
6. Recargar → verificar que los datos persisten

---

## Checkpoint 11: Frontend — Integración en LealtadDashboard

**Objetivo:** Integrar la nueva pestaña "Configuración" en el sistema de filtros y conectar todo.

### 11.1 Modificar `FiltrosLealtad.tsx`

**Archivo:** `frontend/components/Lealtad/FiltrosLealtad.tsx`

- Agregar nueva pill: `'Configuración'`
- Total: 6 pills: `'Ofertas Activas'`, `'Ofertas'`, `'Publicaciones'`, `'Todas'`, `'Calificacion'`, `'Configuración'`

### 11.2 Modificar `LealtadDashboard.tsx`

**Archivo:** `frontend/components/Lealtad/LealtadDashboard.tsx`

- Agregar caso en `getFilteredItems()` o en el render para `'Configuración'`:
  - Cuando `filtroActivo === 'Configuración'` → renderizar `<ConfiguracionWallet idNegocio={negocioId} />`
  - Similar a como `'Calificacion'` renderiza `<WorkspaceCalificacion />`
- Importar `ConfiguracionWallet`

### 11.3 Modificar `WorkspacePublicacion.tsx`

**Archivo:** `frontend/components/Lealtad/WorkspacePublicacion.tsx`

- En la sección de "Oferta vinculada": hacer la card clickeable
- Al hacer clic → navegar al workspace de la oferta
- Necesitar prop `onNavegarAOferta: (idOferta: number) => void` o callback al padre

### 11.4 Modificar `LealtadDashboard.tsx` (navegación publicación → oferta)

- Pasar callback a `WorkspacePublicacion` para navegar a la oferta vinculada
- Buscar la oferta en `feedItems` por `id_oferta` y abrir su workspace

### 11.5 Modificar `WorkspaceOferta.tsx`

**Archivo:** `frontend/components/Lealtad/WorkspaceOferta.tsx`

- **Lógica de visualización de fechas:** Si la oferta tiene `limite_existencias` con valor, NO mostrar fechas (mostrar "Válida hasta agotar existencias")
- Mostrar `premio_en_puntos` y `premio_en_sellos` en la card de detalles

### 11.6 Modificar `OfertaCard.tsx`

**Archivo:** `frontend/components/Lealtad/OfertaCard.tsx`

- Si la oferta tiene `premio_en_puntos` o `premio_en_sellos`, mostrar badge/icono de premio
- Si la oferta tiene `limite_existencias`, NO mostrar fechas

### 11.7 Validación Checkpoint 11

**Test:**
1. Navegar a Lealtad → ver pill "Configuración"
2. Clic en "Configuración" → ver formulario de wallet
3. Crear oferta con nuevo formulario → verificar que aparece en lista
4. Clic en publicación con oferta vinculada → navegar a workspace de oferta
5. Verificar que ofertas con limite_existencias no muestran fechas en cards

---

## Checkpoint 12: Frontend — lealtadService.ts Actualizado

**Objetivo:** Agregar métodos nuevos al servicio.

**Archivo:** `frontend/features/lealtad/lealtadService.ts`

### 12.1 Métodos a Modificar

#### a) `crearOferta` — Payload actualizado
- Ya acepta `premio_en_puntos` y `premio_en_sellos` (son parte del payload genérico)
- Sin cambio explícito necesario (pasa `payload` directo)

#### b) `actualizarConfiguracionLealtad` — Payload actualizado
- Ya acepta el payload genérico, ahora incluirá `productos_estrella`
- Sin cambio explícito necesario

### 12.2 Validación Checkpoint 12

**Test:** Verificar que los métodos existentes manejan los nuevos campos sin errores.

---

## Resumen de Archivos a Modificar

| # | Archivo | Tipo | Checkpoint |
|---|---------|------|------------|
| 1 | `arquitectura_db.dbml` | Modificar | 1 |
| 2 | `backend/lealtad/models.py` | Modificar | 1 |
| 3 | `backend/catalogo/models.py` | Modificar | 1 |
| 4 | `backend/lealtad/schemas.py` | Modificar | 2 |
| 5 | `backend/lealtad/service.py` | Modificar | 3 |
| 6 | `backend/lealtad/router.py` | Modificar | 4 |
| 7 | `backend/datosprueba_BD.py` | Modificar | 5 |
| 8 | `frontend/components/Lealtad/BuscadorCatalogo.tsx` | **NUEVO** | 6 |
| 9 | `frontend/components/Lealtad/CardProductoEstrella.tsx` | **NUEVO** | 7 |
| 10 | `frontend/components/Lealtad/CardReglaNxN.tsx` | **NUEVO** | 8 |
| 11 | `frontend/components/Lealtad/FormularioOferta.tsx` | Modificar (refactor) | 9 |
| 12 | `frontend/components/Lealtad/ConfiguracionWallet.tsx` | **NUEVO** | 10 |
| 13 | `frontend/components/Lealtad/FiltrosLealtad.tsx` | Modificar | 11 |
| 14 | `frontend/components/Lealtad/LealtadDashboard.tsx` | Modificar | 11 |
| 15 | `frontend/components/Lealtad/WorkspacePublicacion.tsx` | Modificar | 11 |
| 16 | `frontend/components/Lealtad/WorkspaceOferta.tsx` | Modificar | 11 |
| 17 | `frontend/components/Lealtad/OfertaCard.tsx` | Modificar | 11 |

**Total:** 13 archivos a modificar + 4 archivos nuevos = 17 archivos

---

## Edge Cases a Considerar

1. **Cartera inexistente al canjear QR:** Si el consumidor no tiene `CarteraLealtad` para ese negocio, crearla automáticamente con saldos 0 antes de otorgar premios.

2. **Oferta sin premios:** Si `premio_en_puntos` y `premio_en_sellos` son ambos null, el QR funciona normalmente (solo registra `HistorialUsoOfertas`) sin tocar la cartera.

3. **Vigencia 0 o null:** Si `meses_vigencia_puntos` es 0 o null, los puntos nunca caducan. No ejecutar lógica de caducidad.

4. **Producto estrella duplicado:** En la configuración, no permitir seleccionar el mismo producto dos veces (validar en frontend y backend).

5. **Multiplicador menor a 1.0:** No tiene sentido un multiplicador < 1.0 (sería penalización). Validar min = 1.0 en frontend y backend.

6. **Porcentaje y monto descuento simultáneos:** El backend debe rechazar (422) si una regla tiene ambos valores. El frontend debe aplicar exclusión mutua automáticamente.

7. **Oferta con limite_existencias y fechas:** Si el frontend envía ambos, el backend ignora las fechas (las pone en null). Solo `limite_existencias` controla la vida de la oferta.

8. **Canje QR con puntos caducados:** Primero resetear saldos a 0 (con registro de caducidad), luego otorgar premios de la oferta. El consumidor ve su saldo nuevo = premios.

9. **Múltiples productos en regla NxN:** Una sola regla (requisito o recompensa) puede tener múltiples `OfertaReglaServicio`. El frontend envía todos en un array `servicios` dentro de la regla.

10. **Configuración sin productos estrella:** Es válido tener configuración sin productos estrella (el negocio simplemente no usa esa feature). El array `productos_estrella` puede estar vacío.

---

## Orden de Ejecución Recomendado

```
CP1 (BD + Models) → CP2 (Schemas) → CP3 (Service) → CP4 (Router) → CP5 (Seed)
    ↓ Backend completo y probado ↓
CP6 (BuscadorCatalogo) → CP7 (CardProductoEstrella) → CP8 (CardReglaNxN)
    ↓ Componentes reutilizables listos ↓
CP9 (FormularioOferta) → CP10 (ConfiguracionWallet) → CP11 (Integración) → CP12 (Service FE)
```

Cada checkpoint es independiente y testeable. Si un checkpoint falla, se corrige antes de avanzar al siguiente.
