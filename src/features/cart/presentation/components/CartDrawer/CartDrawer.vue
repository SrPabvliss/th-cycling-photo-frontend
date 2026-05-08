<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NDrawer } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import { useAuth } from '@/features/auth/composables/use-auth'
import { PUBLIC_GALLERY_PATH, PUBLIC_GALLERY_ROUTE_NAMES } from '@/features/public-gallery/routes'
import { usePublicEventsQuery } from '@/features/public-gallery/composables/queries/use-public-events'
import { useCartStore } from '../../../stores/cart.store'
import { useRemoveFromCart } from '../../../composables/mutations/use-remove-from-cart'
import type { ICartGroup } from '../../../types/responses/cart.response'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated } = useAuth()
const { mutate: removeFromCart } = useRemoveFromCart()
// TODO(PENDING_BACKEND): quitar cuando ICartGroup incluya eventSlug
const { data: publicEvents } = usePublicEventsQuery()

function goToCheckout() {
  emit('update:show', false)
  router.push('/checkout')
}

function handleCheckoutClick() {
  if (isAuthenticated.value) {
    goToCheckout()
  } else {
    emit('update:show', false)
    router.push({ path: '/login', query: { redirect: '/checkout' } })
  }
}

function navigateAndClose(path: string) {
  emit('update:show', false)
  router.push(path)
}

// TODO(PENDING_BACKEND): usar group.eventSlug directamente cuando el backend lo incluya
function goToEventGallery(group: ICartGroup) {
  const match = publicEvents.value?.find((e) => e.name === group.eventName)
  const target = match
    ? { name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY, params: { slug: match.slug } }
    : PUBLIC_GALLERY_PATH
  emit('update:show', false)
  router.push(target)
}

// ── Collapsible groups ──
const collapsed = ref<Set<string>>(new Set())

function toggleGroup(id: string) {
  const next = new Set(collapsed.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  collapsed.value = next
}

function isCollapsed(id: string) {
  return collapsed.value.has(id)
}

// ── Remove all photos from a group (N calls — see PENDING_BACKEND) ──
function removeGroupPhotos(group: ICartGroup) {
  group.photos.forEach((p) => removeFromCart(p.id))
}
</script>

<template>
  <NDrawer :show="show" :width="480" placement="right" @update:show="emit('update:show', $event)">
    <div class="td-shell">
      <!-- ── HEAD ── -->
      <header class="td-head">
        <div class="td-head-row">
          <div>
            <div class="td-eyebrow">Tu pedido</div>
            <h2 class="td-title">Revisa y continúa</h2>
            <div class="td-summary">
              <strong
                >{{ cartStore.totalCount }} foto{{ cartStore.totalCount !== 1 ? 's' : '' }}</strong
              >
              en {{ cartStore.eventCount }} evento{{ cartStore.eventCount !== 1 ? 's' : '' }}
            </div>
          </div>
          <button class="td-close" aria-label="Cerrar" @click="emit('update:show', false)">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <!-- ── BODY ── -->
      <div class="td-body">
        <!-- Empty state -->
        <div v-if="cartStore.totalCount === 0" class="td-empty">
          <div class="td-empty-icon">
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <h3 class="td-empty-title">Tu pedido está vacío</h3>
          <p class="td-empty-desc">
            Explora las galerías, elige las fotos que quieres y agrégalas desde el lightbox o con el
            botón + sobre cada foto.
          </p>
          <button class="td-empty-btn" @click="navigateAndClose(PUBLIC_GALLERY_PATH)">
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
            Ir a eventos
          </button>
        </div>

        <!-- Groups -->
        <template v-else>
          <div v-for="group in cartStore.groups" :key="group.eventId" class="td-group">
            <!-- Group header -->
            <div class="td-g-head" @click="toggleGroup(group.eventId)">
              <svg
                class="td-chev"
                :class="{ 'td-chev--collapsed': isCollapsed(group.eventId) }"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <div class="td-title-block">
                <h3 class="td-g-title">{{ group.eventName }}</h3>
                <div class="td-g-sub">
                  <span>{{ formatDate(group.eventDate) }}</span>
                </div>
              </div>
              <div class="td-g-count">
                <div class="td-g-count-n">{{ group.photos.length }}</div>
                <div class="td-g-count-l">foto{{ group.photos.length === 1 ? '' : 's' }}</div>
              </div>
            </div>

            <!-- Group actions -->
            <div v-if="!isCollapsed(group.eventId)" class="td-g-actions">
              <button class="td-g-link" @click.stop="goToEventGallery(group)">Ver galería</button>
              <span class="td-g-sep">·</span>
              <button class="td-g-btn td-remove-all" @click.stop="removeGroupPhotos(group)">
                Quitar todas
              </button>
            </div>

            <!-- Photo grid -->
            <div v-if="!isCollapsed(group.eventId)" class="td-g-photos">
              <div class="td-p-grid">
                <div v-for="photo in group.photos" :key="photo.id" class="td-p-card">
                  <div
                    class="td-p-pic"
                    :style="`background-image: url(${getGalleryUrl(photo.publicSlug)})`"
                  />
                  <div class="td-p-info">
                    <div class="td-p-id-line">
                      <!-- TODO(PENDING_BACKEND): bib tag requiere campo bibs[] en ICartPhoto -->
                      <span class="td-p-id">{{ photo.id.slice(0, 8) }}</span>
                    </div>
                    <!-- TODO(PENDING_BACKEND): time/session requieren campos en ICartPhoto -->
                  </div>
                  <button
                    class="td-p-remove"
                    aria-label="Quitar foto"
                    @click="removeFromCart(photo.id)"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ── FOOT ── -->
      <footer class="td-foot">
        <!-- Auth banner (shown when not logged in) -->
        <div v-if="!isAuthenticated" class="td-auth-banner">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <div><strong>Inicia sesión</strong> para continuar — guardamos tu pedido.</div>
        </div>

        <button
          class="td-checkout"
          :disabled="cartStore.totalCount === 0"
          @click="handleCheckoutClick"
        >
          <span>{{
            isAuthenticated ? 'Continuar al checkout' : 'Iniciar sesión para continuar'
          }}</span>
          <span class="td-checkout-arrow">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </button>

        <div class="td-hint">Sin pagos online · Coordinas la entrega directo</div>
      </footer>
    </div>
  </NDrawer>
</template>

<style scoped src="./cart-drawer.css" />
