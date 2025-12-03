# Cambios en Dashboard - Tarjetas Interactivas

## Resumen
Se han hecho las dos tarjetas principales del Dashboard completamente funcionales y interactivas:
1. **Citas Pendientes** - Muestra contador dinámico y redirige con filtro automático
2. **Cita Más Cercana** - Muestra fecha real de la próxima cita y redirige ordenada

## Archivos Creados

### 1. `src/hooks/useDashboardAppointments.ts` (NUEVO)
Hook personalizado que maneja toda la lógica de datos del Dashboard:
- Carga datos de citas pendientes y próxima cita
- Formatea fechas en español (mes, día, año)
- Estados: loading, pendingCount, nextAppointment
- Ejecuta llamadas en paralelo para mejor rendimiento

```typescript
const { pendingCount, nextAppointment, formatDate } = useDashboardAppointments();
```

### 2. `src/services/appointmentService.ts` (YA EXISTÍA)
Servicio con funciones para obtener datos de citas:
- `getAppointments()` - Obtiene todas las citas
- `getPendingAppointmentsCount()` - Cuenta citas con estado "Scheduled" o "Pending_assignment"
- `getNextAppointment()` - Retorna la cita más cercana (próxima en el futuro)

## Archivos Modificados

### 1. `src/features/Admin/Dashboard/pages/Dashboard.tsx`
**Cambios:**
- Agregado import: `useNavigate` de react-router-dom
- Agregado import: `useDashboardAppointments` hook
- Reemplazadas tarjetas estáticas por dinámicas
- Tarjeta "Citas Pendientes" ahora:
  - Muestra `pendingCount` actualizado dinámicamente
  - Al hacer click: navega a `/admin-citas` con filtro `filterStatus: 'Scheduled'`
  - Efecto hover: levanta la tarjeta y cambia sombra
  
- Tarjeta "Cita Más Cercana" ahora:
  - Muestra fecha real de la próxima cita formateada (ej: "11 diciembre 2025")
  - Muestra "Sin citas" si no hay próximas citas
  - Al hacer click: navega a `/admin-citas` con sort `sortOrder: 'oldest'`
  - Efecto hover: levanta la tarjeta y cambia sombra

**Eliminado:**
- Arrays `resumen` y `resumen2` que contenían tarjetas estáticas
- Llamada obsoleta a `fetchPendingAppointmentsCount()` (reemplazada por hook)

### 2. `src/features/Admin/AdminApointments/pages/AdminAppointments.tsx`
**Cambios:**
- Agregado import: `useLocation` de react-router-dom
- Agregado hook: `const location = useLocation()`
- Actualizado inicialización de filtros para leer desde `location.state`:
  - Si viene `filterStatus` del Dashboard → se aplica automáticamente
  - Si viene `sortOrder` del Dashboard → se aplica automáticamente
  - Fallback a "all" si no viene nada

```typescript
const locationState = location.state as { filterStatus?: string; sortOrder?: string } | undefined;
const [filterStatus, setFilterStatus] = useState<string>(locationState?.filterStatus || "all");
const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "all">(locationState?.sortOrder || "all");
```

## Flujo de Interacción

### Tarjeta 1: Citas Pendientes
1. Usuario hace click en tarjeta "Citas Pendientes" en Dashboard
2. App navega a `/admin-citas` pasando `{ filterStatus: 'Scheduled' }`
3. AdminAppointments recibe el estado y automáticamente:
   - Establece filtro de estado a "Scheduled"
   - Muestra solo citas programadas
   - Usuario ve citas filtradas sin necesidad de manual selection

### Tarjeta 2: Cita Más Cercana
1. Usuario hace click en tarjeta "Cita Más Cercana" en Dashboard
2. App navega a `/admin-citas` pasando `{ sortOrder: 'oldest' }`
3. AdminAppointments recibe el estado y automáticamente:
   - Establece orden de citas a "Más vieja primero"
   - Muestra citas ordenadas cronológicamente (próximas primero)
   - La fecha mostrada en Dashboard es precisamente la que aparece de primera

## Características Técnicas

### Rendimiento
- Hook usa `Promise.all()` para cargar datos en paralelo
- Datos se cachean en estado (no se refrescan en cada render)
- Componentes re-renderean solo cuando datos cambian

### UX/UI
- Tarjetas con efecto hover (levantamiento + cambio de sombra)
- Cursor cambia a `pointer` para indicar interactividad
- Transiciones suaves (0.3s ease)
- Fechas en formato legible español

### Type Safety
- Toda la lógica está typesada con TypeScript
- Interfaces compartidas entre componentes
- Control de tipos en navegación con state

## Datos Mostrados

### Tarjeta "Citas Pendientes"
- **Origen**: API `/api/admin/appointments`, filtrado por status
- **Valor**: Número total de citas en estado "Scheduled" o "Pending_assignment"
- **Ejemplo**: "8" citas pendientes

### Tarjeta "Cita Más Cercana"
- **Origen**: API `/api/admin/appointments`, ordenado por fecha
- **Valor**: Fecha de la cita más próxima en formato "mes día año"
- **Ejemplo**: "11 diciembre 2025"
- **Fallback**: "Sin citas" si no hay próximas citas

## Testing

Para verificar que todo funciona:
1. Ir al Dashboard del admin
2. Hacer click en "Citas Pendientes" → debe ir a /admin-citas con solo citas "Scheduled"
3. Volver al Dashboard
4. Hacer click en "Cita Más Cercana" → debe ir a /admin-citas ordenado por "Más vieja primero"
5. Las fechas deben actualizarse en tiempo real si se agregan/modifican citas

## Notas
- El hook `useDashboardAppointments` puede reutilizarse en otros componentes
- Los filtros se aplican automáticamente sin interferir con la UI manual
- El usuario puede cambiar filtros manualmente después de llegar desde Dashboard
