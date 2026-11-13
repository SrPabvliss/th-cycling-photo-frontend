<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef } from 'vue'

import { useCartActions, useCartState, type ICartPhotoInput } from '@/shared/cart'
import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { quotePhotos, sortTiers } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { nextTierText } from '@/shared/pricing/tier-text'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'
import { useViewerNavigation } from './use-viewer-navigation'

const props = withDefaults(
  defineProps<{
    /** The list the viewer moves through: what the gallery was showing when it was opened. */
    photos: IPublicPhoto[]
    photoId: string
    event: ICartPhotoInput['event']
    /** Plate the photos were found by, when they come from a plate search. */
    plate?: string | null
    hasNextPage?: boolean
    fetchNextPage?: () => Promise<unknown>
  }>(),
  { plate: null, hasNextPage: false, fetchNextPage: async () => {} },
)

const emit = defineEmits<{
  close: []
  'update:photoId': [photoId: string]
}>()

const cart = useCartState()
const cartActions = useCartActions()
const { data: pricing } = usePricingTiersQuery()

const currentId = computed<string | null>({
  get: () => props.photoId,
  set: (id) => {
    if (id) emit('update:photoId', id)
  },
})

const { hasPrevious, hasNext, previous, next } = useViewerNavigation(
  toRef(props, 'photos'),
  currentId,
  { hasNextPage: toRef(props, 'hasNextPage'), fetchNextPage: () => props.fetchNextPage() },
)

const photo = computed(() => props.photos.find((each) => each.id === props.photoId) ?? null)

const panel = ref<HTMLElement | null>(null)
useDialogFocus(
  panel,
  () => true,
  () => emit('close'),
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') void next()
  else if (event.key === 'ArrowLeft') previous()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

// --- Cart and price ---
const isCartKnown = computed(() => cart.status.value === 'success')
const isInCart = computed(() => isCartKnown.value && cart.isInCart(props.photoId))
const count = computed(() => (isCartKnown.value ? cart.countFor(props.event.id) : 0))
const money = (amount: number) => formatMoney(amount, pricing.value?.currency ?? '')

const cartLabel = computed(() => {
  if (isInCart.value) return 'Quitar del carrito'

  // What each photo would cost with this one in the order.
  const withThis = pricing.value ? quotePhotos(pricing.value.tiers, count.value + 1) : null
  return withThis && isCartKnown.value
    ? `Agregar · ${money(withThis.unitPrice)}`
    : 'Agregar al carrito'
})

const hint = computed(() => {
  if (!isCartKnown.value) return null

  if (count.value > 0) {
    const inCart = `${count.value} ${count.value === 1 ? 'foto' : 'fotos'} en tu carrito.`
    const quote = pricing.value ? quotePhotos(pricing.value.tiers, count.value) : null
    return quote && pricing.value
      ? `${inCart} ${nextTierText(quote, pricing.value.currency)}.`
      : inCart
  }

  const tiers = sortTiers(pricing.value?.tiers ?? [])
  const first = tiers[0]
  const second = tiers[1]
  return first && second && second.pricePerPhoto < first.pricePerPhoto
    ? `Desde ${second.minQty} fotos, todas a ${money(second.pricePerPhoto)} c/u.`
    : null
})

function toggleCart() {
  if (!photo.value) return
  cartActions.toggle({ id: photo.value.id, publicSlug: photo.value.publicSlug, event: props.event })
}
</script>

<template>
  <Teleport to="body">
    <div
      ref="panel"
      class="photo-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      tabindex="-1"
    >
      <div class="photo-viewer__top">
        <button
          type="button"
          class="photo-viewer__round"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <span v-if="plate" class="photo-viewer__plate">Placa #{{ plate }}</span>
        <span class="photo-viewer__spacer" aria-hidden="true" />
      </div>

      <div class="photo-viewer__stage">
        <img
          v-if="photo"
          :key="photo.id"
          class="photo-viewer__photo"
          :src="getGalleryUrl(photo.publicSlug)"
          :alt="plate ? `Foto de la placa ${plate}` : 'Foto del evento'"
          decoding="async"
        />

        <button
          type="button"
          class="photo-viewer__round photo-viewer__nav photo-viewer__nav--previous"
          aria-label="Foto anterior"
          :disabled="!hasPrevious"
          @click="previous"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button
          type="button"
          class="photo-viewer__round photo-viewer__nav photo-viewer__nav--next"
          aria-label="Foto siguiente"
          :disabled="!hasNext"
          @click="next"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div class="photo-viewer__bottom">
        <div class="photo-viewer__notes">
          <span>La marca de agua desaparece al comprar.</span>
          <span v-if="hint" class="photo-viewer__hint">{{ hint }}</span>
        </div>
        <button
          type="button"
          class="photo-viewer__cart"
          :class="{ 'photo-viewer__cart--remove': isInCart }"
          @click="toggleCart"
        >
          {{ cartLabel }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Always dark, whatever the scheme: a photo is looked at against a dark room. */
.photo-viewer {
  position: fixed;
  inset: 0;
  z-index: 1700;
  display: flex;
  flex-direction: column;
  outline: none;
  background: color-mix(in srgb, var(--tt-navy) 45%, black);
  color: var(--tt-on-navy);
  font-family: var(--tt-font-sans);
}

.photo-viewer__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--tt-space-2);
}

.photo-viewer__spacer {
  inline-size: var(--tt-control-m);
}

.photo-viewer__round {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-on-navy);
  cursor: pointer;
}

.photo-viewer__round svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.photo-viewer__plate {
  display: inline-flex;
  align-items: center;
  block-size: var(--tt-icon-xl);
  padding-inline: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-label-weight);
  white-space: nowrap;
}

.photo-viewer__stage {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 0;
}

.photo-viewer__photo {
  max-inline-size: 100%;
  max-block-size: 100%;
  object-fit: contain;
}

.photo-viewer__nav {
  position: absolute;
  inset-block-start: calc(50% - var(--tt-control-m) / 2);
  background: color-mix(in srgb, var(--tt-on-navy) 14%, transparent);
}

.photo-viewer__nav--previous {
  inset-inline-start: var(--tt-space-2);
}

.photo-viewer__nav--next {
  inset-inline-end: var(--tt-space-2);
}

.photo-viewer__nav:disabled {
  opacity: 0.35;
  cursor: default;
}

.photo-viewer__bottom {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  padding: var(--tt-space-3) var(--tt-space-4) calc(var(--tt-space-3) + env(safe-area-inset-bottom));
}

.photo-viewer__notes {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.photo-viewer__cart {
  flex: none;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border: 0;
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  white-space: nowrap;
  cursor: pointer;
}

.photo-viewer__cart--remove {
  background: color-mix(in srgb, var(--tt-on-navy) 14%, transparent);
  color: var(--tt-on-navy);
}
</style>
