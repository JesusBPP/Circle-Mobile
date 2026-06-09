# Mejora UX - Módulo Lealtad [COMPLETADO]

> **Estado:** Todas las fases completadas y verificadas.

**Goal:** Mejorar la experiencia de usuario del módulo de lealtad, corrigiendo bugs críticos y haciendo la interfaz más intuitiva.

**Architecture:** 3 fases independientes + 1 fase adicional de visualización de reglas NxN.

**Tech Stack:** React Native (Expo), TypeScript, FastAPI, SQLAlchemy

---

## Problemas Resueltos

### 🔴 Críticos (RESUELTOS)
1. **Selector de Productos/Servicios:** Reemplazado campo ID manual por dropdown con catálogo completo (productos + servicios)
2. **Bug Botón Pausar:** Corregido para usar `estadoLocal` en lugar de `ofertaData.estado`

### 🟡 Importantes (RESUELTOS)
3. **Validación de Rangos:** Agregada validación para porcentaje (0-100), cantidad (mín 1), montos (mín 0)
4. **Confirmación de Eliminación:** No hay confirmación al eliminar reglas

### 🟢 Mejoras
5. **Preview de Oferta:** No hay vista previa antes de guardar
6. **Mensajes de Error:** Genéricos en lugar de específicos

---

## Fases del Plan

### **Fase 1: Selector de Servicios en FormularioOferta**
**Modelo:** Qwen 3.6 (Frontend)  
**Tiempo estimado:** 45 minutos  
**Archivos a modificar:**
- `frontend/components/Lealtad/FormularioOferta.tsx`
- `frontend/features/lealtad/lealtadService.ts`

**Objetivo:** Reemplazar el campo de texto "ID del Servicio" por un selector dropdown que cargue servicios disponibles desde el endpoint existente.

**Dependencias:**
- Endpoint existente: `GET /api/agenda/negocios/{id_negocio}/servicios` (backend/agenda/router.py:71)
- Retorna: `[{id: number, nombre: string, costo: number}]`

---

### **Fase 2: Corrección de Bugs Críticos**
**Modelo:** Qwen 3.6 (Frontend)  
**Tiempo estimado:** 30 minutos  
**Archivos a modificar:**
- `frontend/components/Lealtad/WorkspaceOferta.tsx`
- `frontend/components/Lealtad/FormularioOferta.tsx`

**Objetivo:** 
1. Arreglar el bug del botón pausar/activar (usa prop en lugar de estado local)
2. Agregar validación de rangos en campos numéricos
3. Agregar confirmación antes de eliminar reglas

---

### **Fase 3: Mejoras de UX (Opcional)**
**Modelo:** Qwen 3.6 (Frontend)  
**Tiempo estimado:** 60 minutos  
**Archivos a modificar:**
- `frontend/components/Lealtad/FormularioOferta.tsx`
- `frontend/components/Lealtad/WorkspaceOferta.tsx`

**Objetivo:**
1. Agregar preview de oferta antes de guardar
2. Mejorar mensajes de error con detalles específicos
3. Agregar indicadores visuales de campos requeridos

---

## Dependencias entre Fases

```
Fase 1 (Selector) ──┐
                    ├──> Fase 3 (Mejoras UX)
Fase 2 (Bugs) ──────┘
```

- **Fase 1 y Fase 2** son independientes y pueden ejecutarse en paralelo
- **Fase 3** depende de que Fase 1 y Fase 2 estén completas

---

## Resumen de Asignación de Modelos

| Fase | Modelo | Razón |
|------|--------|-------|
| **Fase 1** | Qwen 3.6 | Frontend: integración de API, componentes React Native |
| **Fase 2** | Qwen 3.6 | Frontend: corrección de bugs, validaciones, lógica de UI |
| **Fase 3** | Qwen 3.6 | Frontend: mejoras de UX, componentes modales |

---

## Criterios de Aceptación

### Fase 1 Completada Cuando:
- [ ] El selector de servicios carga correctamente desde el endpoint
- [ ] Al seleccionar un servicio, se guarda el ID en la base de datos
- [ ] El selector muestra "Sin servicio específico" cuando no hay selección
- [ ] No hay errores de TypeScript

### Fase 2 Completada Cuando:
- [ ] El botón pausar/activar se actualiza visualmente sin recargar
- [ ] Los campos numéricos validan rangos correctamente
- [ ] Aparece confirmación antes de eliminar reglas
- [ ] No hay errores de TypeScript

### Fase 3 Completada Cuando:
- [ ] Se puede ver preview de la oferta antes de guardar
- [ ] Los mensajes de error son específicos y útiles
- [ ] Los campos requeridos tienen indicadores visuales
- [ ] No hay errores de TypeScript

---

## Notas Técnicas

1. **Endpoint de Servicios:** Ya existe en `backend/agenda/router.py:71`, no es necesario crear uno nuevo
2. **Estado Local vs Props:** El bug del botón se debe a usar la prop inicial en lugar del estado local
3. **Validación de Rangos:** Usar clamp pattern (limitar valores mínimo/máximo)
4. **Confirmaciones:** Usar `Alert.alert` con botones "Cancelar" y "Eliminar" (destructive)

---

## Archivos de Referencia

- `frontend/components/Lealtad/FormularioOferta.tsx` - Formulario de creación de ofertas
- `frontend/components/Lealtad/WorkspaceOferta.tsx` - Vista de detalle de oferta
- `frontend/features/lealtad/lealtadService.ts` - Servicio de API para lealtad
- `backend/agenda/router.py:71` - Endpoint de servicios disponibles
- `arquitectura_db.dbml:219-228` - Estructura de tabla Ofertas_Reglas
