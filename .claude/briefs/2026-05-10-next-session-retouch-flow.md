# Briefing — Próxima sesión: flujo de retoque del operador

**Fecha de corte:** 2026-05-10
**Repos:**

- FE: `/Users/pablov/thesis/projects/cycling-photo-frontend`
- BE: `/Users/pablov/thesis/projects/cycling-photo-backend`

---

## Estado al cierre de la sesión

### PRs abiertas (esta sesión, listas para review/merge)

- BE: `feat/TTV-API-V2-reviewer-flow` → https://github.com/SrPabvliss/th-cycling-photo-backend/pull/58
- FE: `feat/TTV-API-V2-reviewer-flow` → https://github.com/SrPabvliss/th-cycling-photo-frontend/pull/34

> ⚠️ Antes de empezar la nueva sesión, decidir si se mergean estas PRs o si se sigue trabajando en la misma rama. El flujo de retoque depende del workspace ya extraído en `features/workspace/`, así que mergear primero es lo más limpio.

### Lo que quedó funcionando

- Dashboard del operador alineado con admin (KPIs, queue jumps, event cards, activity, completed).
- Cola de revisión per-event como grid (PageHeader + filter bar con chips + grid 4 cols).
- Cola de revisión cross-event (workspace flow desde quick-jump).
- Workspace de revisión desacoplado en `features/workspace/` (shell + header + photo panel + cheatsheet + mobile bar + keyboard composable + queue source pattern).
- Single-photo workspace (`edit-one`) reutiliza el mismo `WorkspaceHeader` con `mode="single"`.
- Filtro `status: 'all' | 'pending' | 'reviewed'` end-to-end (BE + FE).
- Bug "Salir → Zona restringida" resuelto (header emite `exit`, view decide a dónde).

---

## Objetivo principal de la próxima sesión

**Diseñar e implementar el flujo de retoque del operador**, integrándolo correctamente al proceso end-to-end y reutilizando el workspace que ya quedó desacoplado.

### Contexto importante (sin esto te perdés)

1. **El flujo de retoque ya existe parcialmente** pero está desconectado del proceso real. Hoy:
   - Existe `features/retouch/` con vistas y composables para una "queue de retoque" basada en órdenes (orders → fotos pendientes de retoque).
   - El dashboard del operador tiene un quick-jump a `RETOUCH_ROUTE_NAMES.QUEUE` y los `OperatorEventCard` tienen botón "Retoque" que navega ahí.
   - El BE tiene `retouch-queue` por event (`/operator/events/:eventId/retouch-queue`) y endpoints como `confirm-retouched-upload`, `generate-retouched-presigned-url`.
   - **Pero** la UX del retoque NO está modelada como el flujo de revisión (grid intermedio + workspace). Hoy es una vista vieja que no encaja con el resto del producto.

2. **El producto final que necesitamos** (según el spec original `docs/superpowers/specs/2026-05-10-operator-review-queue-design.md`):
   - El operador tiene 2 quick-jumps: Revisión + Retoque.
   - El retoque debería ser visualmente y conceptualmente análogo a la revisión:
     - Quick-jump cross-event → workspace directo en flow mode.
     - Per-event → grid intermedio (cola de retoque) → click foto = workspace `edit-one`, click "Iniciar retoque" = workspace flow.
   - El workspace de retoque difiere del de revisión en:
     - Las acciones que ofrece (subir foto retocada, confirmar, descargar original con marca de agua, etc.).
     - El estado que muestra en el header y en la queue.
     - Posiblemente el panel derecho (no son atributos de placa/colores; son acciones de upload).

3. **El workspace ya quedó desacoplado** justamente para esto. La extensión esperada:
   - Crear `features/workspace/` o `features/retouch/composables/queue-sources/use-retouch-queue-source.ts` siguiendo el patrón `IReviewQueueSource`.
   - Crear `useEventRetouchWorkspace`, `useOperatorRetouchWorkspace`, posiblemente `useSinglePhotoRetouchWorkspace`.
   - El `WorkspaceShell` ya soporta `mode="edit-one"`. Probablemente necesite también algo como `mode="retouch"` o un slot diferente para el panel derecho.
   - Reutilizar `WorkspaceHeader` (probablemente con un nuevo `mode="retouch"` que cambie el copy "Workspace de revisión" → "Workspace de retoque").

### Decisiones que hay que tomar antes de codear (usar `superpowers:brainstorming`)

1. ¿La cola de retoque va por foto pendiente o por orden? Hoy el BE devuelve órdenes; la revisión va por foto.
2. ¿El edit-one mode tiene sentido en retoque? ¿O retoque siempre es flow?
3. ¿Qué acciones expone el panel derecho del workspace de retoque (upload, descargar, marcar como retocada, comparar)?
4. ¿Necesitamos un grid intermedio per-event de retoque o el operador siempre arranca en flow?
5. Atajos de teclado del retoque: ¿qué difiere de la revisión?

### Pasos sugeridos (no comprometedores, ajustar tras brainstorming)

1. **Auditar `features/retouch/` y `modules/operator/.../retouch-queue` en BE** — entender qué hay y qué se desecha.
2. **Brainstorming** del flujo (usar el skill `superpowers:brainstorming`). Sale un spec en `docs/superpowers/specs/`.
3. **Plan** con `superpowers:writing-plans`.
4. **Implementación** con `superpowers:subagent-driven-development` (sin commits intermedios; el usuario los hace al final).

---

## Memorias / reglas estrictas del usuario (crítico respetar)

- **Idioma**: español neutro, sin acentos argentinos. Nunca "verificá", "editá", "entregálas". Sí "verifica", "edita", "entrégalas".
- **No commits ni push ni PRs sin OK explícito por acción.** Aplica también a sub-agentes y skills.
- **No for/while loops.** Preferir array methods funcionales (`map`, `filter`, `reduce`, `flatMap`).

---

## Patrones del codebase que ya están claros (no re-inventar)

### FE (Vue 3 + TanStack Query + Naive UI)

- **Sin layer `services/` o `datasource/`.** Composables llaman `httpClient` directo.
- **Mappers por proyección.** Pure functions `IApi*` → `I*` (snake → camel). Archivo separado por mapper.
- **Types con prefijo `I`** (`IEvent`, `IApiPhoto`, etc.) y `T` para uniones (`TReviewQueueStatusFilter`).
- **Screaming architecture.** Un archivo por query, mutation, mapper, response type.
- **`features/workspace/`** ya tiene el contrato `IReviewQueueSource` que cualquier nueva fuente (incluida retoque) debe implementar.
- **Routes distribuidas** por feature; `OPERATOR_PATH` constante para no hardcodear.
- **Workspace routes mounted outside AppLayout** (ver `routes.ts` `operatorWorkspaceRoutes`).

### BE (NestJS 11 + Prisma 7 + nestjs-cqrs)

- **Atomic endpoints** por sección (no mega-endpoints).
- **Mappers separados** de handlers (no inline shapes).
- **Named types en ports** (no anonymous object literals).
- **PaginationQueryDto compartido** con `Max=50`.
- **CQRS Light + Ports & Adapters**. Cada módulo: `domain/`, `application/`, `infrastructure/`, `presentation/`.

---

## Cosas chicas pendientes (si sobra tiempo)

- Animation/skeleton para el grid de cola de revisión cuando carga (hoy es solo `NSpin`).
- Considerar si el grid per-event debería tener búsqueda por filename/placa (admin la tiene en `GalleryFilterSidebar`).
- Validar copy "Workspace de revisión · Eventos · {eventName}" en el header — el "Eventos · " es un poco raro fuera del contexto admin.

---

## Arranque sugerido para la próxima sesión

```
Sesión nueva. Estoy retomando el flujo del operador desde el brief en
.claude/briefs/2026-05-10-next-session-retouch-flow.md.

Quiero diseñar el flujo de retoque del operador integrado al producto
(no la versión vieja desconectada que existe hoy en features/retouch/).

Empezá auditando features/retouch/ en FE y modules/operator/.../retouch
en BE, después arrancá brainstorming con superpowers:brainstorming.
```
