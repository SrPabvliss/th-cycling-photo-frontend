<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NEmpty, NIcon, NFlex, NInput, NRadioButton, NRadioGroup, NSpin } from 'naive-ui'
import { ArrowBack, Search } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { useCartStore } from '@/features/cart/stores/cart.store'
import { useAddToCart } from '@/features/cart/composables/mutations/use-add-to-cart'
import { useRemoveFromCart } from '@/features/cart/composables/mutations/use-remove-from-cart'
import { usePublicEventDetailQuery } from '../../composables/queries/use-public-event-detail'
import { usePublicEventPhotosInfinite } from '../../composables/queries/use-public-event-photos'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '../../routes'
import PublicPhotoGrid from '../components/PublicPhotoGrid/PublicPhotoGrid.vue'
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { data: event, isPending: isEventPending } = usePublicEventDetailQuery(slug)

const activeCategoryId = ref<number | null>(null)
const bibNumber = ref('')
const bibMatch = ref<'exact' | 'starts' | 'contains'>('exact')

const {
  data: infiniteData,
  isPending: isPhotosPending,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = usePublicEventPhotosInfinite(slug, activeCategoryId, bibNumber, bibMatch)

const allPhotos = computed(() => infiniteData.value?.pages.flatMap((p) => p.items) ?? [])

// --- Cart-based selection ---
const cartStore = useCartStore()
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

// --- Hero image ---
const heroUrl = computed(() => {
  const hero =
    event.value?.assets.find((a) => a.assetType === 'hero_image') ??
    event.value?.assets.find((a) => a.assetType === 'cover_image')
  return hero ? getAssetPresetUrl(hero.publicSlug, 'cover-lg') : null
})
</script>

<template>
  <PublicLayout>
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
        <!-- Category pills -->
        <NFlex v-if="event.photoCategories.length > 0" :size="8" wrap class="gallery-categories">
          <NButton
            :type="activeCategoryId === null ? 'primary' : 'default'"
            size="small"
            round
            @click="activeCategoryId = null"
          >
            Todas
          </NButton>
          <NButton
            v-for="cat in event.photoCategories"
            :key="cat.id"
            :type="activeCategoryId === cat.id ? 'primary' : 'default'"
            size="small"
            round
            @click="activeCategoryId = cat.id"
          >
            {{ cat.name }}
          </NButton>
        </NFlex>

        <div class="public-gallery-search">
          <NInput v-model:value="bibNumber" placeholder="Buscar por dorsal" clearable size="large">
            <template #prefix>
              <NIcon :component="Search" />
            </template>
          </NInput>
          <NRadioGroup v-model:value="bibMatch" size="small" class="public-gallery-bib-match">
            <NRadioButton value="exact">Exacto</NRadioButton>
            <NRadioButton value="starts">Empieza con</NRadioButton>
            <NRadioButton value="contains">Contiene</NRadioButton>
          </NRadioGroup>
        </div>

        <!-- Photo grid -->
        <div v-if="isPhotosPending && allPhotos.length === 0" class="gallery-loading--tight">
          <NSpin />
        </div>

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
      @update:show="showLightbox = $event"
      @toggle="toggleSelect"
    />
  </PublicLayout>
</template>

<style scoped src="./styles/public-event-gallery-view.css" />
