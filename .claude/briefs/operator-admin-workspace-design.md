# Brief — Workspace Operador / Admin (Review + Retouch)

## Contexto

Sistema de fotografía deportiva (ciclismo). Tras un evento, las fotos siguen
dos flujos paralelos manejados por el mismo rol "operador" (admin también
puede ejecutarlos como respaldo):

1. **Review** — al subir las fotos, alguien debe verificar que los números de
   placa (bibs) detectados por IA estén bien, y que los colores asignados
   sean correctos. Sin review, la foto **no aparece** en galería pública.
2. **Retouch** — cuando un cliente paga una orden, las fotos compradas se
   envían a edición (color, exposición, etc). El operador sube la versión
   retocada.

## Problema central

- **Review**: opera por foto, scope evento. Cola continua mientras se suban
  fotos.
- **Retouch**: opera por orden (FIFO por fecha de pago). **Una orden puede
  contener fotos de múltiples eventos** → filtrar la cola de retouch por
  evento rompe el FIFO real (una orden temprana queda bloqueada hasta que
  el operador entre al otro evento).

## Modelo unificado decidido

**Ambas colas son cross-event a nivel datos**, con **filtro opcional por
evento** como UX. Una sola cola por flujo, no una por evento.

- Operador ve solo eventos donde está asignado (tabla `event_operators`).
- Admin ve todos.
- Filtro de evento es chip/select dentro de la vista, no rutas distintas.

## Tres vistas a diseñar

### 1. Dashboard del operador

Punto de entrada. Hoy solo muestra retouch progress, hay que rearmarlo.

Datos disponibles del backend:

- `summary`: `{ assignedEventsCount, pendingRetouchCount }`
  (a extender con `pendingReviewCount`)
- `activeEvents[]`: lista de eventos asignados con stats por evento
  (extender para incluir `pendingReview` además de `retouch`)
- `completedEvents[]`: eventos terminados
- `recentActivity[]`: actividad reciente del operador
  (extender para incluir tipo `'review'` además de `'retouch'`)

Decisiones abiertas para el diseño:

- ¿Cómo balancear "mis colas globales" vs "mis eventos asignados"?
- ¿Qué stats mostrar por evento? (% revisado, fotos totales, etc)
- ¿Cómo mostrar actividad reciente mezclando review + retouch?
- ¿Eventos completados aún tienen relevancia o se ocultan?

### 2. Cola de Review (cross-event, filtrable)

Hoy existe `ReviewWorkspaceView` ligada a `/events/:slug/review`.
Hay que generalizar a cross-event con filtro de evento opcional.

Operación: ver una foto, validar/corregir bibs y colores, marcar como
revisada, pasar a la siguiente. Mobile-first. Workspace ya tiene atomic save
y navegación con teclado.

### 3. Cola de Retoque (cross-event, filtrable)

Hoy existe `RetouchQueueView` en `/retouch` (lista plana, agrupada por
orden). El nuevo diseño debe:

- Mantener FIFO por fecha de orden
- Permitir filtrar por evento (opcional)
- Mostrar foto original vs retocada (ya soportado en código)
- Mostrar contexto de orden (cliente, fotos pendientes en la orden)

## Entry points (rutas)

| Origen                                 | Destino             | Estado            |
| -------------------------------------- | ------------------- | ----------------- |
| Operator dashboard → "Mi cola review"  | Cola review         | sin filtro        |
| Operator dashboard → "Mi cola retouch" | Cola retouch        | sin filtro        |
| Operator dashboard → card de evento    | Cola review/retouch | filtro=ese evento |
| Admin nav top → "Revisión" (NUEVO)     | Cola review         | sin filtro        |
| Admin nav top → "Retoque" (existe)     | Cola retouch        | sin filtro        |
| Admin EventDetailView → quick action   | Cola review/retouch | filtro=ese evento |

## Stack UI

- Vue 3 Composition API + `<script setup>`
- **Naive UI** (componentes ya en uso: NCard, NFlex, NButton, NSpin, NEmpty,
  NResult, NIcon, NTooltip, NEllipsis)
- TanStack Query para estado de servidor
- Mobile-first (operador puede trabajar desde celular)
- Tokens CSS ya definidos: `--tt-primary`, `--tt-neutral-light`,
  `--tt-neutral-mid`, etc.
- Iconos: `@vicons/ionicons5`

## Modelos de datos reales (Prisma — para evitar alucinaciones)

### Tabla `event_operators` (asignación operador↔evento)

```prisma
model EventOperator {
  id             String   @id @default(uuid())
  event_id       String
  user_id        String
  assigned_at    DateTime @default(now())
  assigned_by_id String
  @@unique([event_id, user_id])
}
```

### Tabla `photos`

Campos relevantes para review/retouch:

```
id, event_id, filename, public_slug, status (PhotoStatus enum),
retouched_storage_key, retouched_public_slug, retouched_at,
captured_at, uploaded_at, processed_at, reviewed_at,
created_by_id, retouched_by_id, photo_category_id
```

- `reviewed_at` null → pendiente review
- `retouched_at` null → pendiente retouch
- `status` enum: `pending | processing | processed | failed | reviewed`

### Tabla `orders`

```
id, event_id, user_id, status (pending|paid|delivered|cancelled),
bib_number, subtotal, snap_first_name, snap_last_name, snap_email,
snap_phone, snap_country_id, snap_province_id, snap_canton_id,
snap_category_name, created_at, paid_at, delivered_at, cancelled_at
```

- `status='paid'` + items con foto sin `retouched_at` → entra a cola retouch

### Tabla `corrections` (historial review)

```
id, photo_id, target_type (bib|color), target_id, field,
old_value, new_value, reviewer_id, corrected_at, reason
```

### Roles

```ts
USER_ROLES = { ADMIN: 'admin', OPERATOR: 'operator', CUSTOMER: 'customer' }
```

## Tipos frontend ya existentes

### Cola review item

```ts
interface IReviewQueueItem {
  id: string
  publicSlug: string
  filename: string
  thumbnailUrl: string | null
  status: PhotoStatus
  reviewedAt: Date | null
  minBibConfidence: number | null
  bibsCount: number
  colorsCount: number
}
```

### Cola retouch (agrupada por orden)

```ts
interface IPendingRetouchGroup {
  orderId: string
  orderCreatedAt: Date
  eventName: string
  userName: string
  photos: IPendingRetouchPhoto[]
}

interface IPendingRetouchPhoto {
  id: string
  filename: string
  thumbnailUrl: string
  isRetouched: boolean
}
```

### Dashboard operador (actual — a extender)

```ts
interface IOperatorDashboard {
  summary: { assignedEventsCount: number; pendingRetouchCount: number }
  activeEvents: IActiveEvent[]
  completedEvents: ICompletedEvent[]
  recentActivity: IRecentActivity[]
}

interface IActiveEvent {
  eventId: string
  name: string
  date: Date
  location: string
  coverUrl: string | null
  retouch: { pendingOrders: number; pendingPhotos: number }
}

interface IRecentActivity {
  type: 'retouch' // a extender a 'retouch' | 'review'
  eventName: string
  description: string
  timestamp: Date
}
```

## Datos a agregar en backend (ya planificados)

- `summary.pendingReviewCount` (number)
- `activeEvent.review: { pendingPhotos: number; totalPhotos: number }`
- `activeEvent.retouch.pendingOrders/pendingPhotos` ya existe
- `recentActivity.type` extender a `'review'` (lee `corrections.created_at`
  por reviewer_id del operador)

## Restricciones de diseño

- **Mobile-first** obligatorio. Operador suele trabajar desde celular.
- No alucines campos que no estén en los modelos arriba.
- Puedes proponer agregar campos derivados (ej. % completado), avísalos
  explícitamente como "sugiero exponer en BE".
- Los workspaces internos (review/retouch detail) ya están implementados;
  el diseño se enfoca en **dashboard operador + las dos colas globales**.
- Considera estados vacíos (operador sin eventos asignados, sin pendientes,
  etc) — son frecuentes al inicio.
- Filtro por evento debe ser visible y rápido de aplicar/quitar.

## Lo que esperamos del diseño

1. Layout responsive (mobile, tablet, desktop) para las tres vistas.
2. Estados: loading, empty, error, con datos.
3. Justificación de decisiones (por qué este orden, por qué estos cards).
4. Variantes para admin si difieren del operador (ej. selector de scope).
5. Microcopy en español neutro.
