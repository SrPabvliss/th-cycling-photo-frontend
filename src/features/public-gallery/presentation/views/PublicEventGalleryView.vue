<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NEmpty, NIcon, NSpin } from 'naive-ui'
import { ArrowBack } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { useCartStore } from '@/shared/stores/cart.store'
import { useAddToCart } from '@/shared/composables/use-add-to-cart'
import { useRemoveFromCart } from '@/shared/composables/use-remove-from-cart'
import { usePublicEventDetailQuery } from '../../composables/queries/use-public-event-detail'
import {
  usePublicEventNoBibPhotosInfinite,
  usePublicEventPhotosInfinite,
} from '../../composables/queries/use-public-event-photos'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '../../routes'
import PhotoGridSection from '../components/PhotoGridSection/PhotoGridSection.vue'
import PublicPhotoGrid from '../components/PublicPhotoGrid/PublicPhotoGrid.vue'
import PhotoLightbox from '@/shared/components/PhotoLightbox/PhotoLightbox.vue'
import PublicGalleryFilterBar from '../components/PublicGalleryFilterBar/PublicGalleryFilterBar.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { data: event, isPending: isEventPending } = usePublicEventDetailQuery(slug)

const cartStore = useCartStore()

watch(
  () => event.value?.id ?? null,
  (eventId) => cartStore.setActiveEvent(eventId),
  { immediate: true },
)

onUnmounted(() => cartStore.setActiveEvent(null))

const activeCategoryId = ref<number | null>(null)
const bibNumber = ref('')
const bibMatch = ref<'exact' | 'starts' | 'contains'>('exact')

const bibSearchActive = computed(() => !!bibNumber.value.trim())

// Matched stream (also serves as the default "all photos" stream when no
// bib search is active). The backend swaps semantics based on whether
// bibNumber is included in the params.
const {
  data: infiniteData,
  isPending: isPhotosPending,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = usePublicEventPhotosInfinite(slug, activeCategoryId, bibNumber, bibMatch)

// Companion "no bib detected" stream — only enabled while the user is
// searching by bib so the rider can find themselves when OCR missed the
// plate. Has its own pagination so each section can grow independently.
const {
  data: noBibInfiniteData,
  fetchNextPage: fetchNextNoBibPage,
  hasNextPage: hasNextNoBibPage,
  isFetchingNextPage: isFetchingNextNoBibPage,
} = usePublicEventNoBibPhotosInfinite(slug, activeCategoryId, bibNumber)

const matchedPhotos = computed(() => infiniteData.value?.pages.flatMap((p) => p.items) ?? [])
const noBibPhotos = computed(() => noBibInfiniteData.value?.pages.flatMap((p) => p.items) ?? [])

// Lightbox should navigate through both sections in order: matched
// first, then no_bib. When inactive only the main stream is shown.
const allPhotos = computed(() =>
  bibSearchActive.value ? [...matchedPhotos.value, ...noBibPhotos.value] : matchedPhotos.value,
)

const showNoBibSection = computed(
  () => bibSearchActive.value && (noBibPhotos.value.length > 0 || isFetchingNextNoBibPage.value),
)

// --- Cart-based selection ---
const { mutate: addToCart } = useAddToCart()
const { mutate: removeFromCart } = useRemoveFromCart()

const selectedIds = computed(() => {
  const ids = new Set<string>()
  for (const group of cartStore.groups) {
    for (const photo of group.photos) {
      ids.add(photo.id)
    }
  }
  return ids
})

function toggleSelect(photoId: string) {
  if (cartStore.isInCart(photoId)) {
    removeFromCart(photoId)
  } else {
    addToCart(photoId)
  }
}

// --- Lightbox ---
const showLightbox = ref(false)
const lightboxIndex = ref(0)

function openPreview(index: number) {
  lightboxIndex.value = index
  showLightbox.value = true
}

function handleLoadMore() {
  if (hasNextPage.value && !isFetchingNextPage.value) {
    fetchNextPage()
  }
}

function handleLoadMoreNoBib() {
  if (hasNextNoBibPage.value && !isFetchingNextNoBibPage.value) {
    fetchNextNoBibPage()
  }
}

// --- Hero image ---
const heroUrl = computed(() => {
  const hero =
    event.value?.assets.find((a) => a.assetType === 'hero_image') ??
    event.value?.assets.find((a) => a.assetType === 'cover_image')
  return hero ? getAssetPresetUrl(hero.publicSlug, 'cover-lg') : null
})
</script>

<template>
  <PublicLayout :hide-footer="true">
    <div v-if="isEventPending" class="gallery-loading">
      <NSpin size="large" />
    </div>

    <template v-else-if="event">
      <!-- Hero -->
      <div class="gallery-hero" :style="heroUrl ? { backgroundImage: `url(${heroUrl})` } : {}">
        <div class="gallery-hero__overlay">
          <div class="gallery-hero__content">
            <button
              class="gallery-hero__back"
              @click="router.push({ name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_LIST })"
            >
              <NIcon :component="ArrowBack" :size="18" />
            </button>
            <h1 class="gallery-hero__title">{{ event.name }}</h1>
            <p class="gallery-hero__owner">Fotos de {{ event.ownerName }}</p>
            <p class="gallery-hero__meta">
              <template v-if="event.startDate.getTime() === event.endDate.getTime()">
                {{ formatDate(event.startDate) }}
              </template>
              <template v-else>
                {{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }}
              </template>
              <span v-if="event.cantonName || event.provinceName">
                · {{ [event.cantonName, event.provinceName].filter(Boolean).join(', ') }}
              </span>
              · {{ event.photoCount }} fotos
            </p>
          </div>
        </div>
      </div>

      <div class="gallery-body">
        <PublicGalleryFilterBar
          class="gallery-filter-bar"
          :categories="event.photoCategories"
          :selected-category-id="activeCategoryId"
          :bib-number="bibNumber"
          :bib-match="bibMatch"
          @update:selected-category-id="activeCategoryId = $event"
          @update:bib-number="bibNumber = $event"
          @update:bib-match="bibMatch = $event"
        />

        <div v-if="isPhotosPending && allPhotos.length === 0" class="gallery-loading--tight">
          <NSpin />
        </div>

        <!-- Bib search mode: two physically separate sections so the rider
             can scan their matched photos first, then optionally browse
             the photos where no bib was detected. -->
        <template v-else-if="bibSearchActive">
          <section class="gallery-section">
            <p v-if="matchedPhotos.length === 0" class="gallery-section__empty">
              No encontramos fotos donde se vea esa placa.
            </p>
            <PhotoGridSection
              v-else
              :photos="matchedPhotos"
              :selected-ids="selectedIds"
              :base-index="0"
              :has-more="hasNextPage"
              :is-loading-more="isFetchingNextPage"
              @toggle="toggleSelect"
              @preview="openPreview"
              @load-more="handleLoadMore"
            />
          </section>

          <div v-if="showNoBibSection" class="gallery-divider">
            <div class="gallery-divider__line" />
            <div class="gallery-divider__msg">
              <strong>También puedes buscarte aquí.</strong>
              <span>Mostramos fotos donde no detectamos placa.</span>
            </div>
            <div class="gallery-divider__line" />
          </div>

          <section v-if="showNoBibSection" class="gallery-section">
            <PhotoGridSection
              :photos="noBibPhotos"
              :selected-ids="selectedIds"
              :base-index="matchedPhotos.length"
              :has-more="hasNextNoBibPage"
              :is-loading-more="isFetchingNextNoBibPage"
              @toggle="toggleSelect"
              @preview="openPreview"
              @load-more="handleLoadMoreNoBib"
            />
          </section>

          <NEmpty
            v-if="matchedPhotos.length === 0 && !showNoBibSection"
            description="No encontramos resultados"
            style="padding: 40px 0"
          />
        </template>

        <!-- Default mode (no bib search): keep the existing virtualized
             grid for performance on full-event browsing. -->
        <template v-else-if="allPhotos.length > 0">
          <PublicPhotoGrid
            :photos="allPhotos"
            :selected-ids="selectedIds"
            @toggle="toggleSelect"
            @preview="openPreview"
            @load-more="handleLoadMore"
          />
        </template>

        <NEmpty v-else description="No hay fotos disponibles" style="padding: 40px 0" />
      </div>
    </template>

    <!-- Lightbox -->
    <PhotoLightbox
      :photos="allPhotos"
      :initial-index="lightboxIndex"
      :show="showLightbox"
      :selected-ids="selectedIds"
      actions="select"
      :paginated="true"
      @update:show="showLightbox = $event"
      @toggle="toggleSelect"
      @load-more="handleLoadMore"
    />
  </PublicLayout>
</template>

<style scoped src="./styles/public-event-gallery-view.css" />
