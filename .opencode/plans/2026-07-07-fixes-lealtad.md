# Plan: Corrección de Errores — Módulo Lealtad

**Fecha:** 7 de julio de 2026
**Estado:** Planificación
**Modelos:** Backend → Qwen 3.7 Plus | Frontend → MiniMax M3

---

## Objetivo

Corregir 8 errores/problemas detectados en el módulo de lealtad, mejorar la lógica de ofertas NxN, y agregar actualización en tiempo real del dashboard.

---

## Resumen de Errores

| # | Error | Archivo(s) | Modelo |
|---|-------|------------|--------|
| 1 | VirtualizedList nested in ScrollView | `BuscadorCatalogo.tsx` | Frontend |
| 2 | Descuentos en requisito no se envían | `FormularioOferta.tsx` | Frontend |
| 3 | Backend no valida exclusión mutua fechas/existencias | `service.py`, `schemas.py` | Backend |
| 4 | Switch fechas/existencias en lugar de 3 inputs | `FormularioOferta.tsx` | Frontend |
| 5 | Lógica 2x1 (ambas formas deben funcionar) | `service.py` (validación) | Backend |
| 6 | Dashboard no se actualiza en tiempo real | `LealtadDashboard.tsx`, workspaces | Frontend |
| 7 | Oferta vinculada no se muestra en WorkspacePublicacion | `WorkspacePublicacion.tsx` | Frontend |
| 8 | Reglas NxN no muestran servicios en WorkspaceOferta | `WorkspaceOferta.tsx` | Frontend |

---

## CHECKPOINT 1 (Backend) — Validación de exclusión mutua fechas/existencias

**Modelo:** Qwen 3.7 Plus
**Archivos:** `backend/lealtad/schemas.py`, `backend/lealtad/service.py`

### 1.1 Modificar `schemas.py` — `OfertaCreate`

En el validador `validar_reglas_oferta`, AGREGAR validación de exclusión mutua:

```python
# Si limite_existencias tiene valor Y también hay fechas → error
if limite_existencias is not None and (inicio is not None or fin is not None):
    raise ValueError('No se pueden especificar fechas de vigencia cuando la oferta tiene límite de existencias. Usa uno u otro.')
```

### 1.2 Modificar `service.py` — `crear_oferta_negocio`

Antes de crear la oferta, forzar que si `limite_existencias` tiene valor, las fechas se pongan en None:

```python
if oferta.limite_existencias is not None:
    oferta.fecha_inicio = None
    oferta.fecha_fin = None
```

Esto es una capa de defensa adicional por si el schema deja pasar algo.

### Validación CP1

```bash
# Probar crear oferta con fechas Y limite_existencias → debe dar 422
# Probar crear oferta solo con limite_existencias → debe dar 201
# Probar crear oferta solo con fechas → debe dar 201
```

---

## CHECKPOINT 2 (Backend) — Lógica 2x1 y descuentos en requisito

**Modelo:** Qwen 3.7 Plus
**Archivos:** `backend/lealtad/service.py`

### 2.1 Verificar que el backend ya soporta descuentos en requisito

Actualmente `crear_oferta_negocio` ya pasa `porcentaje_descuento` y `monto_descuento` para TODOS los servicios (requisito y recompensa). El código en la línea del `for servicio in regla.servicios` ya incluye estos campos sin filtrar por `tipo_regla`. **No se requiere cambio en la creación.**

### 2.2 Verificar que la lógica 2x1 funciona en ambas formas

**Forma A:** Requisito con cantidad=2, porcentaje_descuento=50 → Ya funciona. El backend crea la regla con esos valores.

**Forma B:** Requisito cantidad=1 (sin descuento) + Recompensa cantidad=1, porcentaje_descuento=50 → Ya funciona. El backend crea ambas reglas.

**Ambas formas ya son soportadas por el backend.** La interpretación es responsabilidad del POS/frontend al canjear. No se requiere cambio en backend.

### Validación CP2

```bash
# Crear oferta Forma A: requisito con cantidad=2, %=50 → verificar en BD
# Crear oferta Forma B: requisito cantidad=1 + recompensa cantidad=1, %=50 → verificar en BD
# Ambas deben crear registros correctos en ofertas_reglas_servicios
```

---

## CHECKPOINT 3 (Frontend) — Fix VirtualizedList nesting en BuscadorCatalogo

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/BuscadorCatalogo.tsx`

### Problema

`BuscadorCatalogo` usa `<FlatList>` dentro de su dropdown. Este componente se renderiza dentro de un `<ScrollView>` padre (en `FormularioOferta.tsx` línea 176 y `ConfiguracionWallet.tsx` línea 93), causando el error: *"VirtualizedLists should never be nested inside plain ScrollViews"*.

### Solución

Reemplazar `<FlatList>` por un `.map()` con `<TouchableOpacity>` renderizados directamente. El dropdown ya tiene `maxHeight: 200` y `overflow: 'hidden'` en el contenedor, así que el scroll nativo del `ScrollView` padre manejará el desplazamiento.

**Cambio específico:**

```tsx
// ANTES (líneas 78-103):
<FlatList
  data={filtrados.slice(0, maxVisible * 3)}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => ( ... )}
/>

// DESPUÉS:
{filtrados.slice(0, maxVisible * 3).map((item) => (
  <TouchableOpacity
    key={item.id.toString()}
    style={[styles.item, isSelected(item.id) && styles.itemSelected]}
    onPress={() => { toggleSeleccion(item); setMostrarLista(false); }}
  >
    {/* mismo contenido del renderItem */}
  </TouchableOpacity>
))}
```

También eliminar el import de `FlatList` de react-native.

### Validación CP3

- Abrir formulario de oferta → dropdown Productos → buscar → SIN error de VirtualizedList
- Abrir Configuración → buscar producto estrella → SIN error

---

## CHECKPOINT 4 (Frontend) — Switch fechas/existencias + descuentos en requisito

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/FormularioOferta.tsx`

### 4.1 Switch fechas/existencias

**Estado actual (líneas ~218-240):** Hay 3 inputs separados: fecha inicio, fecha fin, y existencias máx. La lógica es condicional (si hay existencias, oculta fechas).

**Cambio:** Reemplazar por un Switch similar al de "Oferta Pública/VIP":

```tsx
// Nuevo estado
const [porExistencias, setPorExistencias] = useState(false);

// En el dropdown "basica", después del switch pública/VIP:
<View style={styles.switchRow}>
  <View style={styles.switchTextWrapper}>
    <View style={[styles.visibilityBadge, porExistencias ? styles.badgeExistencias : styles.badgeFechas]}>
      <Ionicons name={porExistencias ? 'cube' : 'calendar'} size={14} color="#fff" />
      <Text style={styles.visibilityBadgeText}>{porExistencias ? 'Por Existencias' : 'Por Fechas'}</Text>
    </View>
    <Text style={styles.switchSubtitle}>
      {porExistencias ? 'Se agota cuando se acaben las existencias' : 'Válida en un rango de fechas'}
    </Text>
  </View>
  <Switch value={porExistencias} onValueChange={setPorExistencias} trackColor={{ false: '#2563eb', true: '#f59e0b' }} />
</View>

// Condicional:
{porExistencias ? (
  <View>
    <Text style={styles.label}>Existencias Máx.</Text>
    <TextInput style={styles.input} value={limiteStock} onChangeText={setLimiteStock} keyboardType="numeric" placeholder="Ej: 100" />
  </View>
) : (
  <View style={styles.row}>
    <View style={styles.flexItem}>
      <Text style={styles.label}>Válida Desde</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerInicio(true)}>...</TouchableOpacity>
    </View>
    <View style={styles.flexItem}>
      <Text style={styles.label}>Válida Hasta</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPickerFin(true)}>...</TouchableOpacity>
    </View>
  </View>
)}
```

**Eliminar:** El input de "Existencias Máx" que estaba al final del dropdown (línea ~244).

### 4.2 Descuentos en requisito (payload)

**Estado actual:** En `handleGuardar`, el payload de requisito solo envía `id_servicio_disponible`, `cantidad`, `monto_minimo`. NO envía `porcentaje_descuento` ni `monto_descuento`.

**Cambio (líneas ~131-138):** Agregar descuentos al payload de requisito:

```tsx
// ANTES:
servicios: productosRequisito.map(pr => ({
  id_servicio_disponible: pr.producto.id,
  cantidad: pr.cantidad,
  monto_minimo: pr.montoMinimo,
}))

// DESPUÉS:
servicios: productosRequisito.map(pr => ({
  id_servicio_disponible: pr.producto.id,
  cantidad: pr.cantidad,
  porcentaje_descuento: pr.porcentajeDescuento,
  monto_descuento: pr.montoDescuento,
  monto_minimo: pr.montoMinimo,
}))
```

### 4.3 Ajustar payload de fechas

Cuando `porExistencias` es true, enviar `fecha_inicio: undefined` y `fecha_fin: undefined`. Cuando es false, enviar `limite_existencias: undefined`.

```tsx
fecha_inicio: porExistencias ? undefined : fechaInicio.toISOString(),
fecha_fin: porExistencias ? undefined : fechaFin.toISOString(),
limite_existencias: porExistencias ? parseInt(limiteStock) : undefined,
```

### Validación CP4

- Crear oferta por fechas → ver datepickers, no ver existencias
- Crear oferta por existencias → ver input existencias, no ver fechas
- Crear oferta con descuento en requisito → verificar que se envía en payload
- Verificar que no hay error 422

---

## CHECKPOINT 5 (Frontend) — Actualización en tiempo real del dashboard

**Modelo:** MiniMax M3
**Archivos:** `frontend/components/Lealtad/LealtadDashboard.tsx`, `frontend/components/Lealtad/WorkspaceOferta.tsx`, `frontend/components/Lealtad/WorkspacePublicacion.tsx`, `frontend/components/Lealtad/OfertaCard.tsx`

### Problema

`LealtadDashboard` solo refresca datos en `useFocusEffect` (al enfocar la pantalla). Cuando se elimina, pausa o edita una oferta/publicación desde un workspace, el dashboard no se actualiza hasta salir y volver a entrar.

### 5.1 Pasar callback `onRefrescar` a los workspaces

En `LealtadDashboard.tsx`:

```tsx
// Pasar fetchDashboardData como prop a los workspaces
<WorkspaceOferta ofertaData={itemSeleccionado} onRefrescar={fetchDashboardData} />
<WorkspacePublicacion publicacionData={itemSeleccionado} onRefrescar={fetchDashboardData} />
```

### 5.2 WorkspaceOferta — Llamar onRefrescar después de cada acción

Agregar prop `onRefrescar?: () => void` a la interfaz.

Llamar `onRefrescar?.()` después de:
- `toggleEstado` (pausar/activar) → después del Alert de éxito
- `handleGuardarTextos` → después del Alert de éxito

### 5.3 OfertaCard — Llamar onRefrescar después de eliminar

El `OfertaCard` ya tiene prop `onEliminar`. En `LealtadDashboard`, pasar un callback que llame `fetchDashboardData`:

```tsx
<OfertaCard 
  data={item} 
  onPress={() => abrirWorkspace(item)} 
  onEliminar={fetchDashboardData}
/>
```

### 5.4 WorkspacePublicacion — Llamar onRefrescar después de cada acción

Agregar prop `onRefrescar?: () => void` a la interfaz.

Llamar `onRefrescar?.()` después de:
- `handleGuardarTextos` → después del Alert de éxito
- `handleEliminarComentario` → después de eliminar exitosamente

### Validación CP5

- Eliminar oferta → la card desaparece inmediatamente de la lista
- Pausar oferta → el badge cambia a "INACTIVA" inmediatamente
- Editar título → el nuevo título aparece en la card inmediatamente

---

## CHECKPOINT 6 (Frontend) — Mostrar oferta vinculada en WorkspacePublicacion

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/WorkspacePublicacion.tsx`

### Problema

La sección de "Oferta vinculada" (líneas 143-155) muestra una card estática con texto genérico. No muestra el título de la oferta ni es clickeable para navegar al workspace de la oferta.

### 6.1 Agregar prop para navegación

```tsx
interface WorkspacePublicacionProps {
  publicacionData: PublicacionFeedItem;
  onGuardarEdicion?: (nuevosDatos: any) => void;
  onNavegarAOferta?: (idOferta: number) => void;  // NUEVO
}
```

### 6.2 Mostrar título de la oferta y hacer clickeable

Necesitamos el título de la oferta. Opciones:
- **Opción A:** Pasarlo como prop desde el dashboard (que ya tiene los feedItems)
- **Opción B:** Hacer una llamada al dashboard para buscar la oferta

**Usar Opción A** — Pasar `ofertaVinculada` como prop opcional:

```tsx
interface WorkspacePublicacionProps {
  publicacionData: PublicacionFeedItem;
  onGuardarEdicion?: (nuevosDatos: any) => void;
  onNavegarAOferta?: (idOferta: number) => void;
  ofertaVinculada?: { id: number; titulo: string; estado: string } | null;
}
```

En `LealtadDashboard.tsx`, al renderizar WorkspacePublicacion:

```tsx
const ofertaVinculada = itemSeleccionado?.id_oferta 
  ? feedItems.find(i => i.type === 'oferta' && i.id_real === itemSeleccionado.id_oferta)
  : null;

<WorkspacePublicacion 
  publicacionData={itemSeleccionado} 
  onRefrescar={fetchDashboardData}
  onNavegarAOferta={(idOferta) => {
    const oferta = feedItems.find(i => i.type === 'oferta' && i.id_real === idOferta);
    if (oferta) {
      setItemSeleccionado(oferta);
      setVistaActiva('workspaceOferta');
    }
  }}
  ofertaVinculada={ofertaVinculada ? { id: ofertaVinculada.id_real, titulo: ofertaVinculada.titulo, estado: ofertaVinculada.estado } : null}
/>
```

### 6.3 Renderizar la card clickeable

Reemplazar la card estática (líneas 143-155):

```tsx
{publicacionData.id_oferta !== null && ofertaVinculada && (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd', borderWidth: 1 }]}
    onPress={() => onNavegarAOferta?.(publicacionData.id_oferta!)}
    activeOpacity={0.7}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={styles.linkIconBox}>
        <Ionicons name="gift" size={20} color="#3b82f6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkTitle}>📎 {ofertaVinculada.titulo}</Text>
        <Text style={styles.linkSubtitle}>
          Estado: {ofertaVinculada.estado} — Toca para ver detalles
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
    </View>
  </TouchableOpacity>
)}

{publicacionData.id_oferta !== null && !ofertaVinculada && (
  <View style={[styles.card, { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={[styles.linkIconBox, { backgroundColor: '#fee2e2' }]}>
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkTitle}>Oferta vinculada no encontrada</Text>
        <Text style={styles.linkSubtitle}>La oferta pudo haber sido eliminada.</Text>
      </View>
    </View>
  </View>
)}
```

### Validación CP6

- Crear publicación vinculada a oferta → ver título de oferta en workspace
- Clickear la card → navega al workspace de la oferta
- Si la oferta fue eliminada → ver mensaje de "no encontrada"

---

## CHECKPOINT 7 (Frontend) — Mostrar servicios en reglas NxN de WorkspaceOferta

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/WorkspaceOferta.tsx`

### Problema

El código actual (líneas 189-229) itera sobre `reglas` y busca `regla.nombre_servicio_disponible` (campo singular de la interfaz vieja). Pero el backend ahora envía `regla.servicios` (lista de servicios por regla desde la tabla intermedia `OfertaReglaServicio`).

### 7.1 Actualizar interfaz `OfertaFeedItem` en `OfertaCard.tsx`

```tsx
// ANTES:
reglas?: Array<{
  id: number;
  tipo_regla: string;
  id_servicio_disponible: number | null;
  nombre_servicio_disponible: string | null;
  tipo_servicio_disponible: string | null;
  cantidad: number | null;
  porcentaje_descuento: number | null;
  monto_descuento: number | null;
  monto_minimo: number | null;
}>;

// DESPUÉS:
reglas?: Array<{
  id: number;
  tipo_regla: string;
  servicios: Array<{
    id: number;
    id_servicio_disponible: number;
    nombre_servicio: string | null;
    tipo_servicio: string | null;
    cantidad: number;
    porcentaje_descuento: number | null;
    monto_descuento: number | null;
    monto_minimo: number | null;
  }>;
}>;
```

### 7.2 Refactorizar renderizado de reglas en WorkspaceOferta

Reemplazar las líneas 189-229 con iteración sobre `regla.servicios`:

```tsx
{reglas && reglas.length > 0 && (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Ionicons name="layers" size={20} color="#8b5cf6" />
      <Text style={styles.cardTitle}>Reglas de la Oferta (Motor NxN)</Text>
    </View>

    {reglas.map((regla, index) => (
      <View key={regla.id || index} style={styles.reglaItem}>
        <View style={styles.reglaHeader}>
          <Ionicons 
            name={regla.tipo_regla === 'requisito' ? 'checkmark-circle' : 'gift'} 
            size={16} 
            color={regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981'} 
          />
          <Text style={[styles.reglaTipo, { color: regla.tipo_regla === 'requisito' ? '#f59e0b' : '#10b981' }]}>
            {regla.tipo_regla.toUpperCase()}
          </Text>
        </View>
        
        {regla.servicios && regla.servicios.map((servicio, sIndex) => (
          <View key={servicio.id || sIndex} style={styles.servicioItem}>
            <Text style={styles.reglaDetalle}>
              {servicio.tipo_servicio === 'servicio' ? '🔧' : '📦'} {servicio.nombre_servicio || 'Producto'}
            </Text>
            <Text style={styles.reglaDetalle}>Cantidad: {servicio.cantidad}</Text>
            {servicio.porcentaje_descuento && (
              <Text style={styles.reglaDetalle}>Descuento: {servicio.porcentaje_descuento}%</Text>
            )}
            {servicio.monto_descuento && (
              <Text style={styles.reglaDetalle}>Monto descuento: ${servicio.monto_descuento}</Text>
            )}
            {servicio.monto_minimo && (
              <Text style={styles.reglaDetalle}>Monto mínimo: ${servicio.monto_minimo}</Text>
            )}
          </View>
        ))}
      </View>
    ))}
  </View>
)}
```

### 7.3 Agregar estilo `servicioItem`

```tsx
servicioItem: { marginLeft: 24, marginTop: 4, paddingTop: 4, borderTopWidth: 0.5, borderTopColor: '#e2e8f0' },
```

### Validación CP7

- Abrir workspace de oferta con reglas → ver nombres de productos/servicios
- Verificar que se muestran múltiples servicios por regla
- Verificar descuentos y cantidades

---

## Orden de Ejecución

```
CP1 (BE: validación fechas/existencias) → CP2 (BE: verificar lógica 2x1)
    ↓ Backend listo ↓
CP3 (FE: fix VirtualizedList) → CP4 (FE: switch + descuentos requisito)
    ↓
CP5 (FE: refresh en tiempo real) → CP6 (FE: oferta vinculada) → CP7 (FE: reglas NxN)
```

---

## Archivos Totales

| # | Archivo | Tipo | Modelo | CP |
|---|---------|------|--------|-----|
| 1 | `backend/lealtad/schemas.py` | Modificar | Qwen 3.7 Plus | 1 |
| 2 | `backend/lealtad/service.py` | Modificar | Qwen 3.7 Plus | 1, 2 |
| 3 | `frontend/components/Lealtad/BuscadorCatalogo.tsx` | Modificar | MiniMax M3 | 3 |
| 4 | `frontend/components/Lealtad/FormularioOferta.tsx` | Modificar | MiniMax M3 | 4 |
| 5 | `frontend/components/Lealtad/LealtadDashboard.tsx` | Modificar | MiniMax M3 | 5, 6 |
| 6 | `frontend/components/Lealtad/WorkspaceOferta.tsx` | Modificar | MiniMax M3 | 5, 7 |
| 7 | `frontend/components/Lealtad/WorkspacePublicacion.tsx` | Modificar | MiniMax M3 | 5, 6 |
| 8 | `frontend/components/Lealtad/OfertaCard.tsx` | Modificar | MiniMax M3 | 5, 7 |

**Total:** 8 archivos a modificar (2 backend + 6 frontend)

---

## Edge Cases

1. **Oferta con fechas Y existencias:** Backend rechaza con 422. Frontend previene con switch.
2. **Descuento en requisito sin recompensa:** Válido (ej: "shampoo al 50%"). El backend ya lo soporta.
3. **2x1 Forma A vs Forma B:** Ambas válidas. El backend no necesita distinguirlas.
4. **Oferta vinculada eliminada:** Mostrar card de "no encontrada" en WorkspacePublicacion.
5. **Dashboard empty después de eliminar todo:** FlatList muestra `ListEmptyComponent`.
6. **Regla sin servicios:** No debería pasar, pero el frontend debe manejar `servicios` vacío o undefined.
