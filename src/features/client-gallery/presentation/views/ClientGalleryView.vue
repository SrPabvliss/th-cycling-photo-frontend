<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { problemKind } from '@/core/http/problem-kind'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { safeRedirect } from '@/core/navigation/safe-redirect'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState, TtSkeleton, useLoadPhase } from '@/shared/components/loading'
import { usePreviewGallery } from '../../composables/queries/use-preview-gallery'
import { usePhotoSelection } from '../../composables/use-photo-selection'
import { previewProblem } from '../../utils/preview-problem'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import PreviewBar from '../components/PreviewBar/PreviewBar.vue'
import PreviewConfirm from '../components/PreviewConfirm/PreviewConfirm.vue'
import PreviewPicker from '../components/PreviewPicker/PreviewPicker.vue'
import PreviewViewer from '../components/PreviewViewer/PreviewViewer.vue'

const SKELETON_TILES = 6

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const token = computed(() => route.params.token as string)
const { status, data: preview, error, isFetching, refetch } = usePreviewGallery(token)
// Without network a load that did not finish waits for it: the error state says so.
const { isPending, showSkeleton } = useLoadPhase(status)

// The photos on offer: one the buyer already bought is shown, marked, but cannot be chosen.
const photoIds = computed(
  () =>
    preview.value?.photos.filter((photo) => !photo.alreadyPurchased).map((photo) => photo.id) ?? [],
)
const selection = usePhotoSelection(token, photoIds)

// One address, two steps: pick the photos, then confirm the order.
const step = ref<'pick' | 'confirm'>('pick')
const viewing = ref<string | null>(null)

// What the order found out about the link while confirming.
const orderLinkProblem = ref<'already-ordered' | 'expired' | 'not-available' | null>(null)
const photosChanged = ref(false)
const photosBought = ref(false)

// What the link itself says: gone, never there, no longer offered, or already ordered.
const linkProblem = computed(() => {
  if (orderLinkProblem.value) return orderLinkProblem.value
  if (preview.value?.status === 'converted') return 'already-ordered'
  if (preview.value?.status === 'expired') return 'expired'
  if (status.value !== 'error') return null
  return previewProblem(error.value)
})

// Back from signing in with photos chosen: straight to confirming them. Decided once, as soon as
// the preview is there, which may be at once (still in the cache from before signing in).
let decidedReturn = false
watch(
  [preview, () => session.isAuthenticated],
  ([loaded, signedIn]) => {
    if (!loaded || decidedReturn) return
    decidedReturn = true
    if (signedIn && selection.selected.value.length > 0 && step.value === 'pick') {
      step.value = 'confirm'
    }
  },
  { immediate: true },
)

// Some photos left the preview: read it again (the selection drops them) and pick again.
async function onPhotosChanged() {
  photosChanged.value = true
  step.value = 'pick'
  await refetch()
}

// Some chosen photos were bought already: read it again, which marks them and drops them.
async function onPhotosBought() {
  photosBought.value = true
  step.value = 'pick'
  await refetch()
}

function proceed() {
  photosChanged.value = false
  photosBought.value = false
  if (selection.selected.value.length === 0) return
  if (!session.isAuthenticated) {
    const back = safeRedirect(`/preview/${encodeURIComponent(token.value)}`)
    void router.push({ path: ROUTE_PATHS.LOGIN, query: back ? { redirect: back } : {} })
    return
  }
  step.value = 'confirm'
}
</script>

<template>
  <div class="preview-page">
    <div v-if="showSkeleton" class="preview-page__skeleton" aria-busy="true">
      <TtSkeleton width="60%" height="var(--tt-space-6)" radius="text" />
      <div class="preview-page__skeleton-grid">
        <TtSkeleton
          v-for="tile in SKELETON_TILES"
          :key="tile"
          class="preview-page__skeleton-tile"
          height="auto"
          radius="m"
        />
      </div>
    </div>

    <template v-else-if="isPending" />

    <EmptyState
      v-else-if="linkProblem === 'expired'"
      illustration="enlaceExpirado"
      title="Este enlace ya venció"
      text="Pídele al organizador que te comparta uno nuevo."
      :heading-level="1"
    />

    <EmptyState
      v-else-if="linkProblem === 'not-found'"
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

    <EmptyState
      v-else-if="linkProblem === 'already-ordered'"
      illustration="fotosListas"
      title="Ya hiciste este pedido"
      text="Las fotos de esta vista previa ya están pedidas. Revisa el estado en Mis fotos."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="`${ROUTE_PATHS.ACCOUNT}/orders`" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a Mis fotos
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="linkProblem === 'not-available'"
      illustration="enlaceRoto"
      title="Esta vista previa ya no está disponible"
      text="Pídele al organizador que te la comparta de nuevo."
      :heading-level="1"
    />

    <ErrorState
      v-else-if="linkProblem || !preview"
      what="tus fotos"
      :kind="problemKind(error)"
      stacked
      :retrying="isFetching"
      @retry="refetch()"
    />

    <EmptyState
      v-else-if="preview.photos.length === 0"
      illustration="sinResultados"
      title="Todavía no hay fotos en este enlace"
      :heading-level="1"
    />

    <PreviewConfirm
      v-else-if="step === 'confirm'"
      :preview="preview"
      :selection="selection"
      @back="step = 'pick'"
      @link-problem="orderLinkProblem = $event"
      @photos-changed="onPhotosChanged"
      @photos-bought="onPhotosBought"
    />

    <template v-else>
      <FormAlert
        v-if="photosChanged"
        tone="bad"
        title="Algunas fotos ya no están en esta vista previa"
        text="Revisa tu selección y confirma de nuevo."
      />
      <FormAlert
        v-if="photosBought"
        data-test="preview-bought"
        tone="bad"
        title="Ya compraste alguna de las fotos que elegiste"
        text="Las quitamos de tu selección. Las encuentras en Mis fotos."
      />
      <PreviewPicker :preview="preview" :selection="selection" @open="viewing = $event" />
      <PreviewBar :count="selection.selected.value.length" @continue="proceed" />
      <PreviewViewer
        v-if="viewing"
        :photos="preview.photos"
        :photo-id="viewing"
        :selection="selection"
        @close="viewing = null"
        @update:photo-id="viewing = $event"
      />
    </template>
  </div>
</template>

<style scoped src="./client-gallery-view.css" />
