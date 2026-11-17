# Estados de carga y error

Piezas compartidas de la vista de cliente para esperar y para fallar. Salen de la guía de estados
de carga (reglas R1 a R10). Sus estilos usan solo los tokens `--tt-*` de awana, así que se ven bien
únicamente en el área de cliente.

## La convención

1. **Toda vista que carga datos usa `LoadBoundary`.** Cada carga tiene tres salidas distintas:
   contenido, vacío y error con "Reintentar". Un error nunca se pinta como "no hay nada".
2. **Las consultas de carga van con `silent: true`.** El error se pinta dentro de la pantalla; el
   aviso flotante queda para las acciones (guardar, pagar, eliminar).
3. **Nada parpadea.** Una carga de menos de 100 ms no muestra esqueleto, y uno que llega a salir se
   queda al menos 200 ms (`LOADING_SHOW_DELAY_MS`, `LOADING_MIN_VISIBLE_MS`). `LoadBoundary` ya lo
   hace; fuera de él está `useDelayedFlag`.
4. **Al refrescar, lo anterior se queda en pantalla.** Cambiar un filtro o una cantidad no vacía la
   zona: se pasa `refreshing` y el contenido se atenúa hasta que llega el dato nuevo. En la consulta
   va `placeholderData: keepPreviousData`.
5. **El esqueleto mide lo mismo que lo que reemplaza**, para que nada empuje el contenido al llegar.

## Qué pieza usar

| Pieza                                                            | Sí                                                                                                                      | No                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Esqueleto (`TtSkeleton` en el slot `skeleton` de `LoadBoundary`) | Cargar una pantalla, una lista o una grilla. Primera carga de datos.                                                    | Acciones, hojas, botones, procesos (pagar, descargar).                        |
| Spinner con frase (`BusyNote`)                                   | Un proceso de 2 a 10 s que no dibuja contenido: confirmar pago, abrir pasarela, validar un enlace.                      | Cargar listas o pantallas enteras. Más de 10 s sin explicación.               |
| Botón cargando (`NButton` con `:loading` y `:disabled`)          | Todo envío de formulario y toda acción con ida al servidor: confirmar, guardar, cancelar, eliminar, descargar una foto. | Cuando la acción puede ser optimista.                                         |
| Barra superior (`RouteProgressBar`, ya montada en `App.vue`)     | Solo navegación entre pantallas, como acuse inmediato del toque.                                                        | Como único indicador de una carga larga; para acciones dentro de la pantalla. |
| Contador de avance (`ProgressCount`)                             | Varios archivos o pasos contables; cualquier cosa que pase de 10 s.                                                     | Esperas cortas de un solo paso.                                               |
| Optimista (en la mutación, con `onMutate`)                       | Agregar o quitar del carrito, elegir fotos en la vista previa.                                                          | Pagos, pedidos, borrar datos, cualquier cosa difícil de deshacer.             |
| Nada                                                             | Respuestas que llegan en menos de 1 s y validaciones locales.                                                           | Si no hay ninguna otra señal de que el toque se registró.                     |

`ErrorState` es lo que `LoadBoundary` pinta cuando la carga falla. Se usa suelto solo donde no hay
un `LoadBoundary`, por ejemplo dentro de una hoja.

## Ejemplo

La consulta, silenciosa y conservando el dato anterior:

```ts
export function usePublicEventsQuery() {
  return useQuery({
    queryKey: PUBLIC_GALLERY_QUERY_KEYS.events(),
    queryFn: async () => {
      const { data } = await httpClient.get<IApiPublicEventListItem[]>(
        API_ROUTES.PUBLIC_EVENTS.GET_ALL,
        { silent: true },
      )
      return data.map(toPublicEventListItem)
    },
    placeholderData: keepPreviousData,
  })
}
```

La vista:

```vue
<script setup lang="ts">
import { LoadBoundary, TtSkeleton } from '@/shared/components/loading'

const { data: events, status, isFetching, refetch } = usePublicEventsQuery()
</script>

<template>
  <LoadBoundary
    :status="status"
    :empty="events?.length === 0"
    :refreshing="isFetching"
    error-title="No pudimos cargar los eventos"
    @retry="refetch()"
  >
    <template #skeleton>
      <div class="events-grid">
        <TtSkeleton v-for="n in 6" :key="n" class="event-card-skeleton" radius="l" />
      </div>
    </template>

    <template #empty>
      <p>Todavía no hay eventos publicados.</p>
    </template>

    <div class="events-grid">
      <PublicEventCard v-for="event in events" :key="event.slug" :event="event" />
    </div>
  </LoadBoundary>
</template>
```

`status` e `isFetching` se pasan tal cual salen de vue-query. Tras un error, vue-query mantiene
`status === 'error'` mientras reintenta, con `isFetching` en `true`: por eso `refreshing` también
deja el botón "Reintentar" en estado de carga, sin pasar por un hueco vacío.
