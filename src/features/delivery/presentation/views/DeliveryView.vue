<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'

import { problemKind } from '@/core/http/problem-kind'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { EmptyState } from '@/shared/components/empty-state'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, TtSkeleton, useDelayedFlag } from '@/shared/components/loading'
import DownloadAllButton from '@/shared/downloads/DownloadAllButton.vue'
import PurchasedPhotoTile from '@/shared/downloads/PurchasedPhotoTile.vue'
import { downloadFile } from '@/shared/downloads/download-file'
import { useSequentialDownload } from '@/shared/downloads/use-sequential-download'
import { eventDateLabel } from '@/shared/public-events'
import { useDeliveryQuery } from '../../composables/queries/use-delivery'

const SKELETON_TILES = 6

const route = useRoute()
const token = computed(() => route.params.token as string)
const {
  status,
  data: delivery,
  error,
  problem,
  isFetching,
  refetch,
  ensureFresh,
} = useDeliveryQuery(token)
const showSkeleton = useDelayedFlag(computed(() => status.value === 'pending'))

// Only the link itself going bad (expired, out of accesses, unknown) changes the screen. A
// refresh that fails for any other reason leaves the photos already read where they are and
// says so above them, with a retry.
const refreshProblem = computed(() => {
  if (!delivery.value || !problem.value) return null
  if (problem.value === 'rate-limited')
    return { title: 'Demasiados intentos', text: 'Espera un minuto y vuelve a intentarlo.' }
  if (problem.value === 'network' || problem.value === 'unknown')
    return {
      title: 'No pudimos actualizar tus fotos',
      text: 'Puede ser tu conexión. Tus fotos siguen aquí.',
    }
  return null
})

const count = computed(() => delivery.value?.photos.length ?? 0)
const dayOf = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const endsOn = computed(() => {
  const end = delivery.value?.expiresAt
  return end ? eventDateLabel(dayOf(end), dayOf(end)) : null
})
const readyText = computed(() =>
  endsOn.value
    ? `Sin marca de agua y en alta calidad. Este enlace vence el ${endsOn.value}.`
    : 'Sin marca de agua y en alta calidad.',
)

// Addresses about to expire are asked for again before any download.
async function freshPhotos() {
  await ensureFresh()
  return delivery.value?.photos ?? []
}

const downloadingId = ref<string | null>(null)
const singleFailed = ref(false)
async function downloadOne(photoId: string) {
  if (downloadingId.value) return
  downloadingId.value = photoId
  singleFailed.value = false
  try {
    const photo = (await freshPhotos()).find((each) => each.id === photoId)
    if (!photo) throw new Error('Photo not found')
    await downloadFile(photo.downloadUrl, photo.filename)
  } catch {
    singleFailed.value = true
  } finally {
    downloadingId.value = null
  }
}

const downloadAll = useSequentialDownload({
  getFiles: async () =>
    (await freshPhotos()).map((photo) => ({ url: photo.downloadUrl, filename: photo.filename })),
})
const allLabel = computed(() =>
  count.value === 1 ? 'Descargar la foto' : `Descargar las ${count.value} fotos`,
)
</script>

<template>
  <div class="delivery">
    <div v-if="showSkeleton" class="delivery__skeleton" aria-label="Cargando tus fotos">
      <TtSkeleton width="70%" height="var(--tt-space-6)" radius="text" />
      <TtSkeleton height="calc(var(--tt-control-l) + var(--tt-space-3))" radius="m" />
      <div class="delivery__grid">
        <TtSkeleton
          v-for="tile in SKELETON_TILES"
          :key="tile"
          class="delivery__skeleton-tile"
          height="auto"
          radius="m"
        />
      </div>
    </div>

    <template v-else-if="status === 'pending'" />

    <EmptyState
      v-else-if="problem === 'expired'"
      problem
      illustration="enlaceExpirado"
      title="Este enlace ya venció"
      text="Si compraste las fotos con tu cuenta, siguen en Mis fotos."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="`${ROUTE_PATHS.ACCOUNT}/orders`" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a Mis fotos
          </NButton>
        </RouterLink>
        <RouterLink class="delivery__link" :to="ROUTE_PATHS.LANDING">Ir al inicio</RouterLink>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="problem === 'access-limit'"
      problem
      illustration="enlaceExpirado"
      title="Este enlace llegó a su límite de usos"
      text="Por seguridad, cada enlace se puede abrir un número limitado de veces. Si compraste las fotos con tu cuenta, siguen en Mis fotos."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="`${ROUTE_PATHS.ACCOUNT}/orders`" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a Mis fotos
          </NButton>
        </RouterLink>
        <RouterLink class="delivery__link" :to="ROUTE_PATHS.LANDING">Ir al inicio</RouterLink>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="problem === 'not-found'"
      problem
      illustration="enlaceRoto"
      title="Este enlace no es válido"
      text="Puede que esté incompleto. Ábrelo otra vez desde el correo o el mensaje que te llegó."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="ROUTE_PATHS.LANDING" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir al inicio
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>

    <ErrorState
      v-else-if="!delivery"
      what="tus fotos"
      :kind="problem === 'rate-limited' ? 'rate' : problemKind(error)"
      stacked
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else>
      <h1 class="delivery__title">Tus fotos de {{ delivery.eventName }}</h1>
      <FormAlert
        v-if="refreshProblem"
        data-test="refresh-problem"
        tone="warn"
        :title="refreshProblem.title"
        :text="refreshProblem.text"
        :retrying="isFetching"
        @retry="refetch()"
      />
      <FormAlert v-else tone="info" title="Listas para descargar" :text="readyText" />

      <div class="delivery__grid">
        <PurchasedPhotoTile
          v-for="photo in delivery.photos"
          :key="photo.id"
          :thumbnail-url="photo.thumbnailUrl"
          :filename="photo.filename"
          :can-download="true"
          :busy="downloadingId === photo.id"
          @download="downloadOne(photo.id)"
        />
      </div>
      <FormAlert
        v-if="singleFailed"
        tone="warn"
        title="No pudimos descargar la foto. Intenta de nuevo."
      />

      <DownloadAllButton :label="allLabel" :download="downloadAll" />

      <p class="delivery__hint">
        ¿Quieres tenerlas siempre a mano?
        <RouterLink
          :to="{ path: ROUTE_PATHS.LOGIN, query: { redirect: `${ROUTE_PATHS.ACCOUNT}/orders` } }"
        >
          Inicia sesión
        </RouterLink>
        y búscalas en Mis fotos.
      </p>

      <HouseSpot format="AB" :seed="27" />
    </template>
  </div>
</template>

<style scoped>
.delivery {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 12);
  margin-inline: auto;
  padding: var(--tt-space-4) var(--tt-space-4) var(--tt-space-7);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.delivery__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
}

.delivery__skeleton-tile {
  aspect-ratio: 3 / 4;
}

.delivery__title {
  margin: 0;
  font-family: var(--tt-type-display-s-family);
  font-stretch: var(--tt-display-stretch);
  font-size: var(--tt-type-display-s-size);
  line-height: var(--tt-type-display-s-line);
  font-weight: var(--tt-type-display-s-weight);
  text-transform: uppercase;
}

.delivery__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tt-space-2);
}

.delivery__hint {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.delivery__hint a,
.delivery__link {
  color: var(--tt-primary-ink);
  font-weight: var(--tt-type-title-weight);
}

.delivery__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: var(--tt-control-m);
  text-decoration: none;
}

@media (min-width: 768px) {
  .delivery {
    padding-inline: var(--tt-space-6);
  }

  .delivery__title {
    font-size: var(--tt-type-display-m-size);
    line-height: var(--tt-type-display-m-line);
  }

  .delivery__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--tt-space-3);
  }
}
</style>
