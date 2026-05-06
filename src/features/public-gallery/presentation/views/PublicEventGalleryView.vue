<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NEmpty, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl, getGalleryUrl } from '@/shared/utils/cdn.utils'
import { useCartStore } from '@/features/cart/stores/cart.store'
import { useAddToCart } from '@/features/cart/composables/mutations/use-add-to-cart'
import { useRemoveFromCart } from '@/features/cart/composables/mutations/use-remove-from-cart'
import { usePublicEventDetailQuery } from '../../composables/queries/use-public-event-detail'
import { usePublicEventPhotosInfinite } from '../../composables/queries/use-public-event-photos'
import PublicPhotoGrid from '../components/PublicPhotoGrid/PublicPhotoGrid.vue'
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox.vue'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: event, isPending: isEventPending } = usePublicEventDetailQuery(slug)

const activeCategoryId = ref<number | null>(null)

const {
  data: infiniteData,
  isPending: isPhotosPending,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = usePublicEventPhotosInfinite(slug, activeCategoryId)

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

// --- Hero ---
const heroUrl = computed(() => {
  const hero =
    event.value?.assets.find((a) => a.assetType === 'hero_image') ??
    event.value?.assets.find((a) => a.assetType === 'cover_image')
  return hero ? getAssetPresetUrl(hero.publicSlug, 'cover-lg') : null
})

const eventLocation = computed(() => {
  if (!event.value) return null
  const parts = [event.value.cantonName, event.value.provinceName].filter(Boolean)
  return parts.join(', ') || null
})

// --- Filter bar ---
const dorsalSearch = ref('')
const gridSize = ref<'l' | 'm' | 's'>('m')

// Categorías: usa las del backend si existen, sino mock
// TODO(PENDING_BACKEND): el backend debe devolver dayLabel por categoría (ver PENDING_BACKEND.md)
interface ICategoryChip {
  id: number
  dayLabel: string
  name: string
}
const MOCK_CATEGORIES: ICategoryChip[] = [
  { id: 1, dayLabel: 'Jue 23', name: 'Entrenamiento' },
  { id: 2, dayLabel: 'Sáb 25', name: 'Podio' },
  { id: 3, dayLabel: 'Vie 24', name: 'Track walk' },
  { id: 4, dayLabel: 'Dom 26', name: 'Social' },
]
const categoryChips = computed<ICategoryChip[]>(() => {
  const cats = event.value?.photoCategories ?? []
  if (cats.length > 0) return cats.map((c) => ({ id: c.id, dayLabel: '', name: c.name }))
  return MOCK_CATEGORIES
})

// --- Cart bar ---
const router = useRouter()

const eventPhotosInCart = computed(() => allPhotos.value.filter((p) => selectedIds.value.has(p.id)))
const cartBarVisible = computed(() => eventPhotosInCart.value.length > 0)
const cartThumbs = computed(() => eventPhotosInCart.value.slice(0, 5))
const cartOverflow = computed(() => Math.max(0, eventPhotosInCart.value.length - 5))

function clearEventCart() {
  eventPhotosInCart.value.forEach((p) => removeFromCart(p.id))
}

function goToCheckout() {
  router.push('/checkout')
}
</script>

<template>
  <PublicLayout hide-footer>
    <div v-if="isEventPending" class="ev-loading">
      <NSpin size="large" />
    </div>

    <template v-else-if="event">
      <!-- ── EVENT HERO ── -->
      <section class="ev-hero">
        <div class="ev-hero-bg" :style="heroUrl ? `background-image: url(${heroUrl})` : ''" />
        <div class="ev-hero-inner">
          <nav class="ev-breadcrumb">
            <RouterLink to="/">Inicio</RouterLink>
            <span class="ev-breadcrumb-sep">/</span>
            <RouterLink to="/gallery">Eventos</RouterLink>
            <span class="ev-breadcrumb-sep">/</span>
            <span>{{ event.name }}</span>
          </nav>

          <div class="ev-hero-grid">
            <div>
              <div class="ev-hero-tag">Galería abierta</div>
              <h1 class="ev-hero-title">{{ event.name }}</h1>
              <div class="ev-hero-info">
                <div class="ev-hero-info-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {{ formatDate(event.date) }}
                </div>
                <div v-if="eventLocation" class="ev-hero-info-item">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {{ eventLocation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── FILTER BAR ── -->
      <div class="filter-bar">
        <div class="fb-inner">
          <div class="fb-chips">
            <button
              class="fb-chip"
              :class="{ 'fb-chip--active': activeCategoryId === null }"
              @click="activeCategoryId = null"
            >
              <span class="fb-chip-label">Todos</span>
              <span class="fb-chip-name">
                Galería completa
                <span class="fb-chip-count">{{ event.photoCount.toLocaleString() }}</span>
              </span>
            </button>
            <button
              v-for="cat in categoryChips"
              :key="cat.id"
              class="fb-chip"
              :class="{ 'fb-chip--active': activeCategoryId === cat.id }"
              @click="activeCategoryId = cat.id"
            >
              <span class="fb-chip-label" v-html="cat.dayLabel || '&nbsp;'" />
              <span class="fb-chip-name">{{ cat.name }}</span>
            </button>
          </div>

          <div class="fb-right">
            <div class="fb-dorsal">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input v-model="dorsalSearch" type="text" placeholder="# de dorsal" />
            </div>
            <div class="fb-grid-toggle">
              <button
                :class="{ 'fb-grid-toggle--active': gridSize === 'l' }"
                aria-label="Grid grande"
                @click="gridSize = 'l'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="18" height="18" />
                </svg>
              </button>
              <button
                :class="{ 'fb-grid-toggle--active': gridSize === 'm' }"
                aria-label="Grid medio"
                @click="gridSize = 'm'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="8" height="8" />
                  <rect x="13" y="3" width="8" height="8" />
                  <rect x="3" y="13" width="8" height="8" />
                  <rect x="13" y="13" width="8" height="8" />
                </svg>
              </button>
              <button
                :class="{ 'fb-grid-toggle--active': gridSize === 's' }"
                aria-label="Grid pequeño"
                @click="gridSize = 's'"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="5" height="5" />
                  <rect x="10" y="3" width="5" height="5" />
                  <rect x="17" y="3" width="5" height="5" />
                  <rect x="3" y="10" width="5" height="5" />
                  <rect x="10" y="10" width="5" height="5" />
                  <rect x="17" y="10" width="5" height="5" />
                  <rect x="3" y="17" width="5" height="5" />
                  <rect x="10" y="17" width="5" height="5" />
                  <rect x="17" y="17" width="5" height="5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── GALLERY ── -->
      <section class="gallery-wrap">
        <div class="gallery-inner">
          <div class="gallery-meta">
            <div>
              <strong>{{ allPhotos.length.toLocaleString() }}</strong>
              fotos ·
              <span>{{
                activeCategoryId === null
                  ? 'Galería completa'
                  : (event.photoCategories.find((c) => c.id === activeCategoryId)?.name ?? '')
              }}</span>
            </div>
            <div>{{ selectedIds.size }} seleccionada{{ selectedIds.size === 1 ? '' : 's' }}</div>
          </div>

          <div v-if="isPhotosPending && allPhotos.length === 0" class="gallery-loading--tight">
            <NSpin />
          </div>

          <template v-else-if="allPhotos.length > 0">
            <PublicPhotoGrid
              :photos="allPhotos"
              :selected-ids="selectedIds"
              :grid-size="gridSize"
              @toggle="toggleSelect"
              @preview="openPreview"
              @load-more="handleLoadMore"
            />
          </template>

          <NEmpty v-else description="No hay fotos disponibles" style="padding: 40px 0" />
        </div>
      </section>
    </template>

    <!-- Lightbox -->
    <PhotoLightbox
      :photos="allPhotos"
      :initial-index="lightboxIndex"
      :show="showLightbox"
      :selected-ids="selectedIds"
      :event-name="event?.name"
      @update:show="showLightbox = $event"
      @toggle="toggleSelect"
    />

    <!-- ── CART BAR ── -->
    <Teleport to="body">
      <div class="cart-bar" :class="{ 'cart-bar--visible': cartBarVisible }">
        <div class="cart-bar-inner">
          <div class="cart-bar-left">
            <div class="cart-thumbs">
              <div
                v-for="photo in cartThumbs"
                :key="photo.id"
                class="cart-thumb"
                :style="`background-image: url(${getGalleryUrl(photo.publicSlug)})`"
              />
              <div v-if="cartOverflow > 0" class="cart-thumb-more">+{{ cartOverflow }}</div>
            </div>
            <div class="cart-bar-text">
              <div class="cart-bar-count">{{ eventPhotosInCart.length }} fotos en tu pedido</div>
              <div class="cart-bar-sub">Continúa explorando o revisa tu selección</div>
            </div>
          </div>
          <div class="cart-bar-actions">
            <button class="cart-bar-btn-ghost" @click="clearEventCart">Vaciar</button>
            <button class="cart-bar-btn-primary" @click="goToCheckout">
              Revisar pedido
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </PublicLayout>
</template>

<style scoped src="./styles/public-event-gallery-view.css" />

<style>
/* Cart bar — global porque usa Teleport fuera del scope del componente */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #0a0f14;
  color: #fbfaf6;
  padding: 14px 20px;
  z-index: 50;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 -10px 30px rgba(10, 15, 20, 0.2);
}

.cart-bar--visible {
  transform: translateY(0);
}

.cart-bar-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.cart-thumbs {
  display: flex;
  flex-shrink: 0;
}

.cart-thumb {
  width: 40px;
  height: 40px;
  background-color: #232a33;
  background-size: cover;
  background-position: center;
  border: 2px solid #0a0f14;
  margin-left: -8px;
}

.cart-thumb:first-child {
  margin-left: 0;
}

.cart-thumb-more {
  width: 40px;
  height: 40px;
  background: #232a33;
  color: #fbfaf6;
  border: 2px solid #0a0f14;
  margin-left: -8px;
  display: grid;
  place-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}

.cart-bar-count {
  font-family: 'Archivo Black', sans-serif;
  font-size: 16px;
  line-height: 1;
}

.cart-bar-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: #b6bfcb;
  margin-top: 4px;
  text-transform: uppercase;
  display: none;
}

.cart-bar-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.cart-bar-btn-ghost {
  background: transparent;
  color: #fbfaf6;
  border: 1.5px solid rgba(242, 239, 233, 0.3);
  padding: 10px 16px;
  font-family: 'Archivo Black', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s;
}

.cart-bar-btn-ghost:hover {
  border-color: rgba(242, 239, 233, 0.6);
}

.cart-bar-btn-primary {
  background: #fbfaf6;
  color: #0a0f14;
  border: none;
  padding: 12px 20px;
  font-family: 'Archivo Black', sans-serif;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}

.cart-bar-btn-primary:hover {
  background: #f2efe9;
}

@media (min-width: 768px) {
  .cart-bar {
    padding: 18px 40px;
  }

  .cart-bar-count {
    font-size: 18px;
  }

  .cart-bar-sub {
    display: block;
  }

  .cart-bar-actions {
    gap: 10px;
  }

  .cart-bar-btn-ghost {
    padding: 12px 18px;
  }

  .cart-bar-btn-primary {
    padding: 14px 22px;
    font-size: 13px;
  }

  .cart-thumb,
  .cart-thumb-more {
    width: 44px;
    height: 44px;
  }
}
</style>
