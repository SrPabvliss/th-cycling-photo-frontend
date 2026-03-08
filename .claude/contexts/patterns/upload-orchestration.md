# Upload Orchestration — Patterns

> Patrón de orquestación para subir ~500 fotos (10MB c/u) directo a B2 vía presigned URLs.
> Investigación completa en proyecto Claude (claude.ai).

## Arquitectura de Capas

```
Vue Components (lee de Pinia, llama composable)
    ↓
useUploadQueue() composable — orquestación (p-queue, p-retry, connectivity)
    ↓
useUploadStore() Pinia — estado reactivo (shallowRef, throttled progress)
    ↓
b2UploadClient — axios instance dedicada (sin Authorization header)
```

**TanStack Query NO orquesta uploads.** Se usa solo para:

- `queryClient.fetchQuery()` → presigned URLs (con cache 4min)
- `useQuery` + `refetchInterval` → polling de estado
- `queryClient.invalidateQueries()` → una vez al terminar todo el batch

## Máquina de Estados por Foto

```
pending → queued → uploading → uploaded → confirmed
                       ↓
                     failed → retrying → queued → ...
                                             ↓
                                      failed (permanente)
```

- `uploaded` = archivo en B2, backend NO lo sabe aún
- `confirmed` = backend registró metadata → check verde para usuario
- `retrying` = esperando reintento (distinto de fallo permanente)

Transiciones validadas por lookup table:

```typescript
const VALID_TRANSITIONS: Record<UploadStatus, UploadStatus[]> = {
  pending: ['queued'],
  queued: ['uploading'],
  uploading: ['uploaded', 'failed'],
  uploaded: ['confirmed'],
  failed: ['retrying'],
  retrying: ['queued'],
  confirmed: [], // estado final
}
```

## p-queue — Concurrencia

```typescript
import PQueue from 'p-queue'

const queue = new PQueue({
  concurrency: 4, // Chrome permite 6 TCP/dominio, dejamos 2 libres
  timeout: 300_000, // 5 min per task
  autoStart: true,
})
```

Capacidades que usamos:

- `queue.pause()` / `queue.start()` → pausa/reanuda con connectivity monitor
- Priority → reintentos (priority: 100) antes que fotos nuevas (priority: 0)
- `queue.onIdle()` → detectar fin de batch
- `queue.size` / `queue.pending` → UI "X en cola, Y subiendo"

**Eager slot-filling:** cuando un upload termina, el siguiente inicia inmediatamente. No hay dead time.

## p-retry — Reintentos

```typescript
import pRetry, { AbortError } from 'p-retry'

await pRetry(
  async () => {
    /* upload logic */
  },
  {
    retries: 3,
    minTimeout: 1_000,
    maxTimeout: 30_000,
    factor: 2,
    randomize: true, // full jitter — evita thundering herd
  },
)
```

Clasificación de errores:

| Código                  | Acción                                       |
| ----------------------- | -------------------------------------------- |
| Sin response            | RETRY (network error)                        |
| 408, 429, 500, 502, 503 | RETRY (transitorio)                          |
| 403                     | Refresh URL + RETRY (presigned URL expirada) |
| 400, 401, 404, 405, 413 | `throw new AbortError()` (permanente)        |

**429 (rate limit):** respetar header `Retry-After` antes de reintentar.

**Reintentos ocurren DENTRO del slot de p-queue.** No liberan el slot — correcto porque si el problema es transitorio, un archivo nuevo en ese slot también fallaría.

## Pinia Store — shallowRef Optimizations

```typescript
import { shallowRef, triggerRef, markRaw } from 'vue'

// shallowRef: Vue solo trackea la referencia del Map, no sus 500 entries
const uploads = shallowRef<Map<string, UploadItem>>(new Map())

// markRaw: File objects y AbortControllers nunca son proxificados
interface UploadItem {
  id: string
  fileName: string
  status: UploadStatus
  progress: number
  error?: string
  _file: File // markRaw
  _abortController: AbortController | null // markRaw
}

// Actualizar estado: reemplazar Map completo para trigger reactivo
function updateFile(id: string, partial: Partial<UploadItem>) {
  const next = new Map(uploads.value)
  next.set(id, { ...next.get(id)!, ...partial })
  uploads.value = next // un solo trigger reactivo
}
```

## Progress Throttling

`onUploadProgress` de axios dispara ~60 veces/segundo × 4 archivos = ~240 updates/s.
Demasiado para reactivity.

```typescript
// Map NO reactivo — acumula high-frequency updates
const progressMap = new Map<string, { loaded: number; total: number }>()
let flushTimer: number | null = null

function onFileProgress(fileId: string, loaded: number, total: number) {
  progressMap.set(fileId, { loaded, total })
  if (!flushTimer) {
    flushTimer = window.setTimeout(() => {
      flushToStore() // Escribe a Pinia ~7 veces/segundo
      flushTimer = null
    }, 150)
  }
}
```

**Dos métricas de progreso:**

- Bytes: `sum(loaded) / sum(total)` → barra de progreso suave
- Conteo: `247 de 500 fotos` → texto de estado

## Connectivity Monitor — 3 Capas

1. `navigator.onLine` + eventos `online`/`offline` → detección rápida (false es confiable, true no)
2. Heartbeat `HEAD /api/health` → 30s online, 5s offline
3. Debounce 2s → evita toggles rápidos

Offline: `queue.pause()`. Online: `queue.start()`.
Inestable (toggles rápidos): reducir concurrencia a 1 en vez de pausar.

## Recovery (recarga/crash)

1. localStorage persiste `{ eventId, totalFiles, sessionId, completedCount }`
2. File objects se pierden (restricción del browser) → usuario re-selecciona carpeta
3. `GET /events/:eventId/photos` → backend retorna confirmadas
4. Diff por `fileName + fileSize + lastModified` → encolar solo faltantes
5. `sessionId` distingue sesión vieja de upload nuevo intencional

## Virtual Scrolling

500 items en la lista → usar virtual scroll de Naive UI.
Solo ~20 nodos DOM visibles, independiente del total.

## Batch Confirm

Cada ~20 fotos `uploaded`, enviar batch al backend:

```
POST /events/:eventId/photos/confirm-batch
Body: { photos: [{ fileName, fileSize, objectKey, contentType }] }
```

Las fotos pasan a `confirmed` al recibir respuesta OK.
