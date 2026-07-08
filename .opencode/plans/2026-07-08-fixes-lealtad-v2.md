# Plan v2: Fixes Detallados — Módulo Lealtad

**Fecha:** 8 de julio de 2026
**Estado:** Planificación
**Modelos:** Backend → Qwen 3.7 Plus | Frontend → MiniMax M3
**Predecesor:** `2026-07-07-fixes-lealtad.md`

---

## Diagnóstico de Problemas

| # | Problema | Causa Raíz | Archivo | Modelo |
|---|----------|------------|---------|--------|
| 1 | Workspace no se actualiza al pausar | `fetchDashboardData` setea `isLoading=true`, lo que reemplaza el workspace con un loader. Al terminar, `itemSeleccionado` no se refresca con datos nuevos. | `LealtadDashboard.tsx` | Frontend |
| 2 | Inputs de descuento no aparecen en Requisito | `CardReglaNxN.tsx` envuelve `% Desc.` y `$ Desc.` en `{!esRequisito && (...)}` — solo se renderizan para recompensa | `CardReglaNxN.tsx` | Frontend |
| 3 | No se puede escribir en %Desc/$Desc de Recompensa | `keyboardType="numeric"` no permite decimales. `Math.max(1, val)` impide escribir valores < 1. | `CardReglaNxN.tsx` | Frontend |
| 4 | Solo se ven productos, no servicios | Seed data de Cafetería El Grano tiene 11 productos y solo 1 servicio. El backend funciona correctamente. | `datosprueba_BD.py` | Backend |

---

## CHECKPOINT 1 (Frontend) — Fix actualización en tiempo real del Workspace

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/LealtadDashboard.tsx`

### Problema Detallado

Cuando `WorkspaceOferta` llama `onRefrescar()` → `fetchDashboardData()`:
1. `setIsLoading(true)` → el dashboard renderiza el loader, destruyendo el workspace
2. Al completar, `setIsLoading(false)` → vuelve a renderizar el workspace, pero `itemSeleccionado` tiene datos stale
3. El workspace se re-monta con `ofertaData` viejo → el botón de Pausar/Activar no cambia

### Solución

**1.1 Crear función `refrescarSilencioso`** que NO setee `isLoading`:

```tsx
const refrescarSilencioso = async () => {
  if (!negocioId) return;
  try {
    const data = await lealtadService.obtenerDashboard(negocioId);
    const nuevosItems = data.feed_items || [];
    setFeedItems(nuevosItems);
    
    // Actualizar itemSeleccionado con datos frescos
    if (itemSeleccionado) {
      const itemActualizado = nuevosItems.find(i => i.id === itemSeleccionado.id);
      if (itemActualizado) {
        setItemSeleccionado(itemActualizado);
      }
    }
  } catch (error) {
    console.error("Error en refresh silencioso:", error);
  }
};
```

**1.2 Pasar `refrescarSilencioso` a los workspaces** en lugar de `fetchDashboardData`:

```tsx
<WorkspaceOferta ofertaData={itemSeleccionado} onRefrescar={refrescarSilencioso} />

<WorkspacePublicacion
  publicacionData={itemSeleccionado}
  onRefrescar={refrescarSilencioso}
  ...
/>
```

**1.3 Mantener `fetchDashboardData`** (con loader) solo para:
- `useFocusEffect` (carga inicial)
- `handleBack` (volver a la lista)
- `onEliminar` en `OfertaCard` (eliminar de la lista)
- `onSuccess` en `ModalCrearLealtad` (nueva oferta/publicación creada)

### Validación CP1

1. Abrir workspace de oferta activa
2. Clickear "Pausar Oferta"
3. Verificar: el botón cambia a "Activar Oferta" INMEDIATAMENTE sin parpadeo ni loader
4. Verificar: el badge de estado cambia de "Activa" a "Pausada"
5. Volver a la lista → la card muestra "INACTIVA"

---

## CHECKPOINT 2 (Frontend) — Mostrar inputs de descuento en Requisito + fix teclado

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/CardReglaNxN.tsx`

### Problema 2a: Descuentos ocultos en Requisito

Línea 79 del código actual:
```tsx
{!esRequisito && (
  <>
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>% Desc.</Text>
      ...
    </View>
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>$ Desc.</Text>
      ...
    </View>
  </>
)}
```

Los inputs de descuento están DENTRO del bloque `{!esRequisito && ...}`, por lo que NO se renderizan cuando `esRequisito=true`.

### Solución 2a

Mover los inputs de `% Desc.` y `$ Desc.` FUERA del bloque `{!esRequisito && ...}` para que se muestren tanto en requisito como en recompensa. El input `$ Mín.` permanece dentro de `{esRequisito && ...}`.

Estructura resultante:
```tsx
<View style={styles.fieldsRow}>
  {/* Cantidad — siempre visible */}
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>Cantidad</Text>
    <TextInput ... />
  </View>

  {/* % Desc — siempre visible (requisito Y recompensa) */}
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>% Desc.</Text>
    <TextInput ... />
  </View>

  {/* $ Desc — siempre visible (requisito Y recompensa) */}
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>$ Desc.</Text>
    <TextInput ... />
  </View>

  {/* $ Mín — solo requisito */}
  {esRequisito && (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>$ Mín.</Text>
      <TextInput ... />
    </View>
  )}
</View>
```

### Problema 2b: Teclado no permite decimales

Líneas 88 y 101: `keyboardType="numeric"` no incluye punto decimal en algunos dispositivos.

### Solución 2b

**Para `% Desc.`:**
- Cambiar `keyboardType="numeric"` a `keyboardType="decimal-pad"`
- Eliminar el `Math.max(1, val)` del clamp. El rango válido es 0-100, pero permitir escribir "0" como inicio de "0.5":
```tsx
onChangeText={(t) => {
  if (t === '') { onPorcentajeChange(null); return; }
  const val = parseFloat(t);
  if (!isNaN(val) && val >= 0 && val <= 100) {
    onPorcentajeChange(val);
    onMontoDescuentoChange(null);
  }
}}
```

**Para `$ Desc.`:**
- Cambiar `keyboardType="numeric"` a `keyboardType="decimal-pad"`
- El handler ya está correcto (solo valida `val >= 0`)

**Para `$ Mín.` (requisito):**
- Cambiar `keyboardType="numeric"` a `keyboardType="decimal-pad"`

### Validación CP2

1. Abrir formulario de oferta → dropdown Productos
2. Seleccionar producto en Requisito → card muestra: Cantidad, % Desc, $ Desc, $ Mín
3. Seleccionar producto en Recompensa → card muestra: Cantidad, % Desc, $ Desc (sin $ Mín)
4. Escribir "50" en % Desc de requisito → se acepta
5. Escribir "30.5" en $ Desc de recompensa → se acepta
6. Escribir en % Desc → $ Desc se borra automáticamente (exclusión mutua)
7. Escribir en $ Desc → % Desc se borra automáticamente

---

## CHECKPOINT 3 (Backend) — Agregar servicios al seed data de Cafetería El Grano

**Modelo:** Qwen 3.7 Plus
**Archivo:** `backend/datosprueba_BD.py`

### Problema

Cafetería El Grano (negocio1, `carlos@negocio.com`) tiene 11 productos y solo 1 servicio ("Reserva Mesa VIP") en su catálogo disponible. El backend funciona correctamente, pero el seed data no tiene suficientes servicios para una cafetería.

### Solución

Agregar 3-4 nuevos `ServicioProducto` de tipo servicio para Cafetería El Grano, y sus correspondientes `ServicioDisponible` en las sucursales:

**Nuevos ServicioProducto (tipo="servicio"):**
```python
serv_cata = ServicioProducto(nombre="Cata de Café", costo=200.00, tipo_producto="servicio")
serv_preparacion = ServicioProducto(nombre="Clase de Preparación", costo=350.00, tipo_producto="servicio")
serv_evento = ServicioProducto(nombre="Evento Privado", costo=1500.00, tipo_producto="servicio")
serv_domicilio = ServicioProducto(nombre="Servicio a Domicilio", costo=50.00, tipo_producto="servicio")
```

**Nuevos ServicioDisponible (en Café Centro):**
```python
ServicioDisponible(id_servicio_producto=serv_cata.id, id_sucursal=sucursal_cafe_centro.id)
ServicioDisponible(id_servicio_producto=serv_preparacion.id, id_sucursal=sucursal_cafe_centro.id)
ServicioDisponible(id_servicio_producto=serv_evento.id, id_sucursal=sucursal_cafe_centro.id)
```

**Nuevos ServicioDisponible (en Café Sur):**
```python
ServicioDisponible(id_servicio_producto=serv_cata.id, id_sucursal=sucursal_cafe_sur.id)
ServicioDisponible(id_servicio_producto=serv_domicilio.id, id_sucursal=sucursal_cafe_sur.id)
```

### Validación CP3

```bash
python EjecucionCircle.py  # Opción 1 (reset) + Opción 2 (seed)
# Verificar: endpoint GET /api/lealtad/negocios/1/catalogo-disponible
# Debe retornar ~16 items (11 productos + 5 servicios)
```

---

## CHECKPOINT 4 (Frontend) — BuscadorCatalogo: mostrar todos los items al hacer focus

**Modelo:** MiniMax M3
**Archivo:** `frontend/components/Lealtad/BuscadorCatalogo.tsx`

### Problema

Actualmente el dropdown solo se muestra cuando hay texto escrito en el input Y hay resultados filtrados. El comportamiento deseado es:

1. Al hacer **focus** en el input → mostrar **TODOS** los productos/servicios disponibles (no seleccionados)
2. Máximo **4 items visibles** a la vez, con **scroll** para ver más
3. Conforme se escribe → filtrar la lista en tiempo real
4. Al seleccionar un item → cerrarse el dropdown

### Comportamiento Actual (líneas 77-103)

```tsx
{mostrarLista && filtrados.length > 0 && (
  <View style={styles.dropdown}>
    {/* .map() de items */}
  </View>
)}
```

El problema:
- `filtrados` filtra por texto de búsqueda (`busqueda.toLowerCase()`)
- Si el input está vacío, `filtrados` incluye todos los no seleccionados (correcto)
- Pero la condición `filtrados.length > 0` puede fallar si todo está seleccionado
- Además, `mostrarLista` se resetea a `false` al cerrar, y solo se reactiva al escribir o hacer focus

### Solución

**4.1 Cambiar la condición de renderizado del dropdown:**

```tsx
// ANTES:
{mostrarLista && filtrados.length > 0 && ( ... )}

// DESPUÉS:
{mostrarLista && (
  <View style={styles.dropdown}>
    {filtrados.length > 0 ? (
      filtrados.slice(0, maxVisible * 3).map((item) => (
        <TouchableOpacity
          key={item.id.toString()}
          style={[styles.item, isSelected(item.id) && styles.itemSelected]}
          onPress={() => {
            toggleSeleccion(item);
            setMostrarLista(false);
          }}
        >
          {/* contenido del item */}
        </TouchableOpacity>
      ))
    ) : (
      <View style={styles.noResults}>
        <Ionicons name="search-outline" size={20} color="#cbd5e1" />
        <Text style={styles.noResultsText}>
          {busqueda.length > 0 ? `Sin resultados para "${busqueda}"` : 'Todos los items ya seleccionados'}
        </Text>
      </View>
    )}
  </View>
)}
```

**4.2 Asegurar que `mostrarLista` se active al hacer focus:**

El código actual ya tiene `onFocus={() => setMostrarLista(true)}` (línea 71). Verificar que funcione correctamente.

**4.3 Ajustar el estilo del dropdown para scroll nativo:**

```tsx
dropdown: {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#e2e8f0',
  borderRadius: 12,
  marginTop: 4,
  maxHeight: 220, // Ajustar para ~4 items visibles
  overflow: 'hidden', // Permite scroll nativo del ScrollView padre
}
```

El `maxHeight: 220` permite ver aproximadamente 4 items (cada item tiene ~50px de altura). El scroll nativo del `ScrollView` padre (en `FormularioOferta` y `ConfiguracionWallet`) manejará el desplazamiento si hay más items.

**4.4 Eliminar el mensaje de "Sin resultados" separado:**

Eliminar el bloque de líneas 105-113 que muestra "Sin resultados" por separado, ya que ahora está integrado en el dropdown principal.

### Validación CP4

1. Abrir formulario de oferta → dropdown Productos
2. Hacer focus en el input de Requisito (sin escribir nada)
3. Verificar: se muestra el dropdown con TODOS los productos/servicios disponibles
4. Verificar: se ven máximo 4 items, el resto se puede hacer scroll
5. Escribir "cap" → la lista se filtra a "Capuchino Grande", "Café Americano", etc.
6. Seleccionar un item → el dropdown se cierra, el item aparece como card debajo
7. Volver a hacer focus → el dropdown muestra los items restantes (sin el seleccionado)
8. Seleccionar todos los items → hacer focus → muestra mensaje "Todos los items ya seleccionados"

---

## Orden de Ejecución

```
CP1 (FE: fix refresh silencioso) → CP2 (FE: descuentos en requisito + teclado) → CP4 (FE: BuscadorCatalogo mostrar todos al focus)
    ↓ Frontend listo ↓
CP3 (BE: seed data servicios) → Reset BD + Seed → Verificar
```

CP1, CP2 y CP4 pueden ejecutarse juntos ya que tocan archivos diferentes.
CP3 es independiente y puede ejecutarse en paralelo.

---

## Archivos Totales

| # | Archivo | Tipo | Modelo | CP |
|---|---------|------|--------|-----|
| 1 | `frontend/components/Lealtad/LealtadDashboard.tsx` | Modificar | MiniMax M3 | 1 |
| 2 | `frontend/components/Lealtad/CardReglaNxN.tsx` | Modificar | MiniMax M3 | 2 |
| 3 | `backend/datosprueba_BD.py` | Modificar | Qwen 3.7 Plus | 3 |
| 4 | `frontend/components/Lealtad/BuscadorCatalogo.tsx` | Modificar | MiniMax M3 | 4 |

**Total:** 4 archivos a modificar (1 backend + 3 frontend)

---

## Edge Cases

1. **Refresh silencioso con oferta eliminada:** Si la oferta fue eliminada (soft delete), `itemActualizado` será undefined. En ese caso, navegar de vuelta a la lista.
2. **Descuento 0%:** Permitir 0 como valor válido (significa "sin descuento"). El backend lo interpreta como null.
3. **Porcentaje decimal:** "33.5" debe ser aceptado. `decimal-pad` permite punto decimal.
4. **Nuevo servicio sin sucursal:** Los servicios nuevos solo están disponibles en ciertas sucursales, no en todas. Esto es correcto (un "Evento Privado" puede no ofrecerse en todas las sucursales).
5. **BuscadorCatalogo con todos seleccionados:** Si todos los items están seleccionados, mostrar mensaje "Todos los items ya seleccionados" en lugar de lista vacía.
6. **BuscadorCatalogo con catálogo vacío:** Si el negocio no tiene productos/servicios, mostrar mensaje "No hay productos disponibles" al hacer focus.
