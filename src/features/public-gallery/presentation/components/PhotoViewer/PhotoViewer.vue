<script setup lang="ts">
import { computed } from 'vue'

import AdSlot from '@/features/ads/presentation/components/AdSlot/AdSlot.vue'
import { useCartActions, useCartState, type ICartPhotoInput } from '@/shared/cart'
import { quotePhotos, sortTiers } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { nextTierText } from '@/shared/pricing/tier-text'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import type { IPublicPhoto } from '../../../types/responses/public-photo.response'
import PhotoViewerFrame from '@/shared/photo-viewer/PhotoViewerFrame.vue'

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

const photo = computed(() => props.photos.find((each) => each.id === props.photoId) ?? null)

// What the shared frame shows: the gallery image of each photo.
const framePhotos = computed(() =>
  props.photos.map((each) => ({
    id: each.id,
    src: getGalleryUrl(each.publicSlug),
    alt: props.plate ? `Foto de la placa ${props.plate}` : 'Foto del evento',
  })),
)

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
  <PhotoViewerFrame
    :photos="framePhotos"
    :photo-id="photoId"
    label="Foto ampliada"
    :has-next-page="hasNextPage"
    :fetch-next-page="fetchNextPage"
    @close="emit('close')"
    @update:photo-id="emit('update:photoId', $event)"
  >
    <template #badge>
      <span v-if="plate" class="photo-viewer__plate">Placa #{{ plate }}</span>
    </template>
    <template #footer>
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
    </template>
    <template #after>
      <AdSlot class="photo-viewer__ad" format="D" :seed="41" />
    </template>
  </PhotoViewerFrame>
</template>

<style scoped>
/* What the gallery adds to the shared viewer: the plate, the price notes and the cart. */
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

.photo-viewer__ad {
  margin-inline: auto;
}

.photo-viewer__cart--remove {
  background: color-mix(in srgb, var(--tt-on-navy) 14%, transparent);
  color: var(--tt-on-navy);
}
</style>
