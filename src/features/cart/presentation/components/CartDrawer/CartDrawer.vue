<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton } from 'naive-ui'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { checkoutPath, ROUTE_PATHS } from '@/core/navigation/route-paths'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { usePriceSheet } from '@/features/pricing/composables/use-price-sheet'
import { useCartActions, useCartState } from '@/shared/cart'
import { EmptyState } from '@/shared/components/empty-state'
import { LoadBoundary, TtSkeleton } from '@/shared/components/loading'
import SessionExpiredNotice from '@/shared/components/SessionExpiredNotice/SessionExpiredNotice.vue'
import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import { useCartStore } from '@/shared/stores/cart.store'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'

const TITLE_ID = 'cart-drawer-title'
const SKELETON_THUMBS = 4

// Mounted straight into a layout slot, so its open state lives in the store rather than in a prop
// the header has no way to pass down.
const cartStore = useCartStore()
const session = useSessionStore()
const cart = useCartState()
const cartActions = useCartActions()
const { data: pricing } = usePricingTiersQuery()
const priceSheet = usePriceSheet()

const panel = ref<HTMLElement | null>(null)
const close = () => cartStore.setDrawerOpen(false)
useDialogFocus(panel, () => cartStore.isDrawerOpen, close)

// Every event of the cart is priced on its own: each one is a separate order with its own tier.
const events = computed(() =>
  cart.groups.value.map((group) => {
    const count = group.photos.length
    const quote = pricing.value ? quotePhotos(pricing.value.tiers, count) : null
    const money = (amount: number) => formatMoney(amount, pricing.value?.currency ?? '')

    return {
      group,
      count: `${count} ${count === 1 ? 'foto' : 'fotos'}`,
      unit: quote ? `${money(quote.unitPrice)} c/u` : null,
      total: quote ? money(quote.total) : null,
      // The checkout asks for a session to confirm: without one, sign in first and come back.
      confirm: session.isAuthenticated
        ? checkoutPath(group.eventId)
        : { path: ROUTE_PATHS.LOGIN, query: { redirect: checkoutPath(group.eventId) } },
    }
  }),
)

function explainPrices() {
  const only = cart.groups.value.length === 1 ? cart.groups.value[0] : null
  priceSheet.open(only ? only.photos.length : 0)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="cartStore.isDrawerOpen" class="cart-drawer">
      <button
        type="button"
        class="cart-drawer__scrim"
        aria-label="Cerrar carrito"
        tabindex="-1"
        @click="close"
      />

      <div
        ref="panel"
        class="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="TITLE_ID"
        tabindex="-1"
      >
        <div class="cart-drawer__head">
          <h2 :id="TITLE_ID" class="cart-drawer__title">Tu carrito</h2>
          <button type="button" class="cart-drawer__close" aria-label="Cerrar" @click="close">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <!-- The session expired with the cart on screen: say so, it is not an empty cart. -->
        <SessionExpiredNotice
          v-if="session.expired"
          text="Inicia sesión de nuevo para seguir con tu carrito. Tus fotos siguen guardadas."
          @leave="close"
        />

        <LoadBoundary
          v-else
          :status="cart.status.value"
          :empty="cart.groups.value.length === 0"
          :refreshing="cart.status.value === 'error' && cart.isFetching.value"
          error-title="No pudimos cargar tu carrito"
          error-text="Puede ser tu conexión."
          @retry="cart.refetch()"
        >
          <template #skeleton>
            <div class="cart-drawer__skeleton" aria-label="Cargando tu carrito">
              <TtSkeleton width="60%" height="var(--tt-space-5)" radius="text" />
              <div class="cart-drawer__thumbs">
                <TtSkeleton
                  v-for="n in SKELETON_THUMBS"
                  :key="n"
                  class="cart-drawer__thumb-skeleton"
                  height="auto"
                  radius="m"
                />
              </div>
              <TtSkeleton height="var(--tt-control-m)" radius="m" />
            </div>
          </template>

          <template #empty>
            <EmptyState
              illustration="carritoVacio"
              title="Tu carrito está vacío"
              text="Busca tu placa en un evento y agrega las fotos que quieras."
            >
              <template #actions>
                <RouterLink v-slot="{ href, navigate }" :to="ROUTE_PATHS.PUBLIC_GALLERY" custom>
                  <NButton
                    tag="a"
                    :href="href"
                    type="primary"
                    size="large"
                    block
                    @click="(event: MouseEvent) => (close(), navigate(event))"
                  >
                    Ver eventos
                  </NButton>
                </RouterLink>
              </template>
            </EmptyState>
          </template>

          <div class="cart-drawer__events">
            <section v-for="item in events" :key="item.group.eventId" class="cart-drawer__event">
              <div class="cart-drawer__row">
                <strong class="cart-drawer__event-name">{{ item.group.eventName }}</strong>
                <span class="cart-drawer__event-count">{{ item.count }}</span>
              </div>

              <ul class="cart-drawer__thumbs">
                <li v-for="photo in item.group.photos" :key="photo.id" class="cart-drawer__thumb">
                  <img
                    :src="getGalleryUrl(photo.publicSlug)"
                    alt="Foto en el carrito"
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    type="button"
                    class="cart-drawer__remove"
                    aria-label="Quitar foto"
                    @click="cartActions.remove(photo.id)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                </li>
              </ul>

              <!-- Stays mounted while the quantity changes: the figures update in place. -->
              <div v-if="item.total" class="cart-drawer__row cart-drawer__price">
                <span class="cart-drawer__unit">{{ item.unit }}</span>
                <strong class="cart-drawer__total">{{ item.total }}</strong>
              </div>

              <RouterLink v-slot="{ href, navigate }" :to="item.confirm" custom>
                <NButton
                  tag="a"
                  :href="href"
                  type="primary"
                  size="large"
                  block
                  @click="(event: MouseEvent) => (close(), navigate(event))"
                >
                  Confirmar pedido
                </NButton>
              </RouterLink>
            </section>
          </div>

          <p v-if="events.length > 1" class="cart-drawer__note">
            Cada evento se confirma como un pedido aparte.
          </p>

          <button type="button" class="cart-drawer__prices" @click="explainPrices">
            Cómo funcionan los precios
          </button>

          <!-- Only with photos: this slot is the cart's own content, never its empty state. -->
          <HouseSpot format="D" :seed="23" />
        </LoadBoundary>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Mobile: a sheet from the bottom. From 768px: a panel on the right. */
.cart-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--tt-layer-drawer);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-family: var(--tt-font-sans);
}

.cart-drawer__scrim {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  padding: 0;
  border: 0;
  background: var(--tt-scrim);
  cursor: default;
}

.cart-drawer__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  max-block-size: var(--tt-sheet-max-height);
  padding: var(--tt-space-4) var(--tt-space-4) calc(var(--tt-space-5) + env(safe-area-inset-bottom));
  overflow-y: auto;
  outline: none;
  border-radius: var(--tt-radius-xl) var(--tt-radius-xl) 0 0;
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  animation: cart-drawer-up var(--tt-motion-sheet) var(--tt-easing-standard);
}

.cart-drawer__head,
.cart-drawer__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-3);
}

.cart-drawer__title {
  margin: 0;
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.cart-drawer__close {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-ink);
  cursor: pointer;
}

.cart-drawer__close:hover {
  background: var(--tt-surface-sunken);
}

.cart-drawer__close svg,
.cart-drawer__remove svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.cart-drawer__close svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
}

.cart-drawer__skeleton,
.cart-drawer__events,
.cart-drawer__event {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
}

.cart-drawer__events {
  gap: var(--tt-space-5);
}

.cart-drawer__event + .cart-drawer__event {
  padding-block-start: var(--tt-space-5);
  border-block-start: thin solid var(--tt-line-subtle);
}

.cart-drawer__event-count,
.cart-drawer__unit {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.cart-drawer__thumbs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--tt-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.cart-drawer__thumb {
  position: relative;
}

.cart-drawer__thumb img,
.cart-drawer__thumb-skeleton {
  display: block;
  inline-size: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--tt-radius-m);
}

.cart-drawer__remove {
  position: absolute;
  inset-block-start: calc(var(--tt-space-1) / 2);
  inset-inline-end: calc(var(--tt-space-1) / 2);
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: calc(var(--tt-space-6) - var(--tt-space-1));
  block-size: calc(var(--tt-space-6) - var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: color-mix(in srgb, var(--tt-navy) 60%, transparent);
  color: var(--tt-on-navy);
  cursor: pointer;
}

.cart-drawer__remove svg {
  inline-size: var(--tt-icon-s);
  block-size: var(--tt-icon-s);
}

.cart-drawer__total {
  font-family: var(--tt-type-number-family);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-number-line);
  font-weight: var(--tt-type-number-weight);
  font-variant-numeric: tabular-nums;
}

.cart-drawer__note {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.cart-drawer__prices {
  align-self: center;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

@keyframes cart-drawer-up {
  from {
    transform: translateY(100%);
  }
}

@keyframes cart-drawer-in {
  from {
    transform: translateX(100%);
  }
}

@media (min-width: 768px) {
  .cart-drawer {
    align-items: flex-end;
    justify-content: stretch;
  }

  .cart-drawer__panel {
    inline-size: var(--tt-drawer-width);
    block-size: 100%;
    max-block-size: none;
    padding: var(--tt-space-5);
    border-radius: 0;
    box-shadow: var(--tt-shadow-pop);
    animation-name: cart-drawer-in;
  }

  .cart-drawer__thumbs {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .cart-drawer__panel {
    animation: none;
  }
}
</style>
