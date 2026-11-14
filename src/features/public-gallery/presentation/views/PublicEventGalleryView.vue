<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import NotFoundView from '@/core/views/NotFoundView.vue'
import EventPresenterStrip from '@/features/house-spots/presentation/components/EventPresenterStrip/EventPresenterStrip.vue'
import { useCartActions, useCartState } from '@/shared/cart'
import { EmptyState } from '@/shared/components/empty-state'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, LoadBoundary, TtSkeleton, useDelayedFlag } from '@/shared/components/loading'
import { eventDateLabel } from '@/shared/public-events'
import { useGalleryPlate } from '../../composables/use-gallery-plate'
import { useGalleryViewer } from '../../composables/use-gallery-viewer'
import { usePublicEventDetailQuery } from '../../composables/queries/use-public-event-detail'
import {
  usePublicEventNoBibPhotosInfinite,
  usePublicEventPhotosInfinite,
} from '../../composables/queries/use-public-event-photos'
import { toCalendarDate } from '../../utils/calendar-date'
import GalleryHero from '../components/GalleryHero/GalleryHero.vue'
import GalleryCartBar from '../components/GalleryCartBar/GalleryCartBar.vue'
import PhotoGridSection from '../components/PhotoGridSection/PhotoGridSection.vue'
import PhotoGridSkeleton from '../components/PhotoGridSkeleton/PhotoGridSkeleton.vue'
import PhotoViewer from '../components/PhotoViewer/PhotoViewer.vue'
import PublicGalleryFilterBar from '../components/PublicGalleryFilterBar/PublicGalleryFilterBar.vue'
import PublicPhotoGrid from '../components/PublicPhotoGrid/PublicPhotoGrid.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const countFormat = new Intl.NumberFormat('es-EC')
const photosWord = (count: number) => (count === 1 ? 'foto' : 'fotos')

// --- The event ---
const {
  data: event,
  status: eventStatus,
  error: eventError,
  isFetching: isEventFetching,
  refetch: refetchEvent,
} = usePublicEventDetailQuery(slug)

const isEventPending = computed(() => eventStatus.value === 'pending')
const showEventSkeleton = useDelayedFlag(isEventPending)
const isEventMissing = computed(
  () => isAxiosError(eventError.value) && eventError.value.response?.status === 404,
)
const hasPhotos = computed(() => (event.value?.photoCount ?? 0) > 0)

const eventDateText = computed(() => {
  if (!event.value) return ''
  const start = toCalendarDate(event.value.startDate)
  const end = toCalendarDate(event.value.endDate)
  return `${start === end ? 'el' : 'del'} ${eventDateLabel(start, end)}`
})

// --- Plate and category ---
const {
  plate,
  draft,
  error: plateError,
  submit: searchPlate,
  clear: clearPlate,
} = useGalleryPlate()
const categoryId = ref<number | null>(null)
const categories = computed(() => event.value?.photoCategories ?? [])

// --- Photos ---
// With a plate, the main list is the photos of that exact plate; without one, every photo.
const {
  data: photoPages,
  status: photosStatus,
  isPlaceholderData,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  fetchNextPage,
  refetch: refetchPhotos,
} = usePublicEventPhotosInfinite(slug, categoryId, plate)
// vue-query marks the whole query as failed when only the next page did: the photos on screen
// stay, and the failure is said under them. Scrolling no longer asks again; the retry does.
const photosBoundaryStatus = computed(() =>
  isFetchNextPageError.value ? 'success' : photosStatus.value,
)
const hasMorePhotos = computed(() => hasNextPage.value && !isFetchNextPageError.value)

// Next to a plate search: the photos where no plate could be read, for the rider the recognition
// missed. Paged on its own.
const {
  data: noPlatePages,
  hasNextPage: hasNextNoPlatePage,
  isFetchingNextPage: isFetchingMoreNoPlate,
  isFetchNextPageError: isMoreNoPlateError,
  fetchNextPage: fetchMoreNoPlate,
} = usePublicEventNoBibPhotosInfinite(slug, categoryId, plate)
const hasMoreNoPlate = computed(() => hasNextNoPlatePage.value && !isMoreNoPlateError.value)

const photos = computed(() => photoPages.value?.pages.flatMap((page) => page.items) ?? [])
const photosTotal = computed(() => photoPages.value?.pages[0]?.pagination.total ?? 0)
const noPlatePhotos = computed(() =>
  plate.value ? (noPlatePages.value?.pages.flatMap((page) => page.items) ?? []) : [],
)

// What is on screen while another search loads belongs to the previous one: its plate label and
// its "no results" do not apply to the new search yet.
const shownPlate = ref(plate.value)
watch([plate, isPlaceholderData], ([current, isPrevious]) => {
  if (!isPrevious) shownPlate.value = current
})
const isSearchEmpty = computed(
  () => shownPlate.value !== null && photos.value.length === 0 && !isPlaceholderData.value,
)

const countText = computed(() =>
  shownPlate.value
    ? `${countFormat.format(photosTotal.value)} ${photosWord(photosTotal.value)} con la placa`
    : `${countFormat.format(photosTotal.value)} ${photosWord(photosTotal.value)} · mostrando ${countFormat.format(photos.value.length)}`,
)

function loadMore() {
  if (hasMorePhotos.value && !isFetchingNextPage.value) fetchNextPage()
}
function loadMoreNoPlate() {
  if (hasMoreNoPlate.value && !isFetchingMoreNoPlate.value) fetchMoreNoPlate()
}

// --- Cart ---
const cart = useCartState()
const cartActions = useCartActions()

const everyPhoto = computed(() => [...photos.value, ...noPlatePhotos.value])
const selectedIds = computed(() => new Set(event.value ? cart.photoIdsFor(event.value.id) : []))
const busyIds = computed(
  () =>
    new Set(
      everyPhoto.value.filter((photo) => cartActions.isBusy(photo.id)).map((photo) => photo.id),
    ),
)

function toggle(photoId: string) {
  const photo = everyPhoto.value.find((each) => each.id === photoId)
  if (!photo || !cartEvent.value) return

  cartActions.toggle({ id: photo.id, publicSlug: photo.publicSlug, event: cartEvent.value })
}

// --- Photo viewer ---
const viewer = useGalleryViewer()

// The viewer moves through the list the photo was opened from: the main one (with its plate, in
// a search) or the photos with no plate detected.
const viewed = computed(() => {
  const id = viewer.photoId.value
  if (!id || !event.value) return null

  if (photos.value.some((photo) => photo.id === id)) {
    return {
      photos: photos.value,
      plate: shownPlate.value,
      hasNextPage: hasNextPage.value,
      fetchNextPage: () => fetchNextPage(),
    }
  }
  if (noPlatePhotos.value.some((photo) => photo.id === id)) {
    return {
      photos: noPlatePhotos.value,
      plate: null,
      hasNextPage: hasMoreNoPlate.value,
      fetchNextPage: () => fetchMoreNoPlate(),
    }
  }
  return null
})

const cartEvent = computed(() =>
  event.value
    ? {
        id: event.value.id,
        name: event.value.name,
        slug: event.value.slug,
        startDate: event.value.startDate,
        endDate: event.value.endDate,
      }
    : null,
)
</script>

<template>
  <div class="gallery">
    <!-- The event is loading: the shape of the screen, once the wait is long enough to show it. -->
    <div v-if="isEventPending || showEventSkeleton" class="gallery__loading" aria-busy="true">
      <template v-if="showEventSkeleton">
        <TtSkeleton class="gallery__hero-skeleton" height="auto" radius="text" />
        <div class="gallery__body">
          <PhotoGridSkeleton />
        </div>
      </template>
    </div>

    <NotFoundView v-else-if="isEventMissing" />

    <ErrorState
      v-else-if="!event"
      class="gallery__error"
      title="No pudimos cargar este evento"
      text="Puede ser tu conexión."
      :retrying="isEventFetching"
      @retry="refetchEvent()"
    />

    <template v-else>
      <GalleryHero :event="event" />

      <div v-if="!hasPhotos" class="gallery__body">
        <EmptyState
          illustration="sinEventos"
          title="Las fotos todavía no están"
          :text="`Este evento es ${eventDateText}. Publicamos las fotos después de la carrera.`"
        >
          <template #actions>
            <RouterLink v-slot="{ href, navigate }" :to="ROUTE_PATHS.PUBLIC_GALLERY" custom>
              <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
                Ver otros eventos
              </NButton>
            </RouterLink>
          </template>
        </EmptyState>
      </div>

      <template v-else>
        <div class="gallery__body">
          <form class="gallery__search" novalidate @submit.prevent="searchPlate">
            <label class="gallery__plate">
              <span class="gallery__plate-label">N.º de placa</span>
              <span class="gallery__plate-field">
                <span aria-hidden="true" class="gallery__plate-hash">#</span>
                <input
                  v-model="draft"
                  class="gallery__plate-input"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="127"
                  aria-label="Número de placa"
                  :aria-invalid="plateError ? 'true' : undefined"
                  :aria-describedby="plateError ? 'gallery-plate-error' : undefined"
                />
              </span>
            </label>
            <NButton
              class="gallery__search-submit"
              type="primary"
              size="large"
              attr-type="submit"
              :loading="isPlaceholderData"
            >
              Buscar
            </NButton>
          </form>
          <p v-if="plateError" id="gallery-plate-error" class="gallery__plate-error" role="alert">
            {{ plateError }}
          </p>

          <EventPresenterStrip class="gallery__presenter" />

          <PublicGalleryFilterBar
            v-if="categories.length > 1"
            v-model="categoryId"
            :categories="categories"
          />

          <LoadBoundary
            :status="photosBoundaryStatus"
            :refreshing="isPlaceholderData"
            error-title="No pudimos cargar las fotos"
            error-text="Puede ser tu conexión."
            @retry="refetchPhotos()"
          >
            <template #skeleton>
              <PhotoGridSkeleton />
            </template>

            <EmptyState
              v-if="isSearchEmpty"
              illustration="sinResultados"
              :title="`No hay fotos con la placa ${shownPlate}`"
              text="Revisa el número. Buscamos la placa exacta, sin coincidencias parciales."
            >
              <template #actions>
                <NButton size="large" block @click="clearPlate">Ver todas las fotos</NButton>
              </template>
            </EmptyState>

            <template v-else>
              <div class="gallery__count-row">
                <span class="gallery__count">
                  {{ countText }}{{ shownPlate ? ' ' : ''
                  }}<strong v-if="shownPlate">#{{ shownPlate }}</strong>
                </span>
                <button v-if="shownPlate" type="button" class="gallery__link" @click="clearPlate">
                  Ver todas
                </button>
              </div>

              <!-- A plate search is a short list: a plain grid, with the plate on every tile. -->
              <PhotoGridSection
                v-if="shownPlate"
                :photos="photos"
                :selected-ids="selectedIds"
                :busy-ids="busyIds"
                :plate="shownPlate"
                :has-more="hasMorePhotos"
                :is-loading-more="isFetchingNextPage"
                @open="viewer.open"
                @toggle="toggle"
                @load-more="loadMore"
              />

              <!-- Every photo of the event can be thousands: only the rows on screen are drawn. -->
              <PublicPhotoGrid
                v-else
                with-spot
                :photos="photos"
                :selected-ids="selectedIds"
                :busy-ids="busyIds"
                :has-more="hasMorePhotos"
                :is-loading-more="isFetchingNextPage"
                @open="viewer.open"
                @toggle="toggle"
                @load-more="loadMore"
              />
              <FormAlert
                v-if="hasNextPage && isFetchNextPageError"
                class="gallery__more-problem"
                data-test="more-problem"
                tone="warn"
                title="No pudimos cargar más fotos"
                text="Puede ser tu conexión. Las que ya ves se quedan."
                :retrying="isFetchingNextPage"
                @retry="fetchNextPage()"
              />
            </template>

            <section v-if="noPlatePhotos.length > 0" class="gallery__no-plate">
              <div class="gallery__no-plate-head">
                <h2 class="gallery__no-plate-title">También puedes buscarte aquí.</h2>
                <p class="gallery__no-plate-text">Mostramos fotos donde no detectamos placa.</p>
              </div>
              <PhotoGridSection
                :photos="noPlatePhotos"
                :selected-ids="selectedIds"
                :busy-ids="busyIds"
                :has-more="hasMoreNoPlate"
                :is-loading-more="isFetchingMoreNoPlate"
                @open="viewer.open"
                @toggle="toggle"
                @load-more="loadMoreNoPlate"
              />
              <FormAlert
                v-if="hasNextNoPlatePage && isMoreNoPlateError"
                class="gallery__more-problem"
                tone="warn"
                title="No pudimos cargar más fotos"
                text="Puede ser tu conexión. Las que ya ves se quedan."
                :retrying="isFetchingMoreNoPlate"
                @retry="fetchMoreNoPlate()"
              />
            </section>
          </LoadBoundary>
        </div>

        <GalleryCartBar :event-id="event.id" />
      </template>
    </template>

    <PhotoViewer
      v-if="viewed && cartEvent && viewer.photoId.value"
      :photos="viewed.photos"
      :photo-id="viewer.photoId.value"
      :event="cartEvent"
      :plate="viewed.plate"
      :has-next-page="viewed.hasNextPage"
      :fetch-next-page="viewed.fetchNextPage"
      @update:photo-id="viewer.show"
      @close="viewer.close"
    />
  </div>
</template>

<style scoped src="./styles/public-event-gallery-view.css" />
