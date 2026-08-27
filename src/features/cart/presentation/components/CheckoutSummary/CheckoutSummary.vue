<script setup lang="ts">
import { computed } from 'vue'
import { NDivider, NIcon } from 'naive-ui'
import { CloseCircleOutline } from '@vicons/ionicons5'

import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import { formatDate } from '@/shared/utils/date.utils'
import PhotoLightbox from '@/shared/components/PhotoLightbox/PhotoLightbox.vue'
import PhotoPriceStrip from '@/features/pricing/presentation/components/PhotoPriceStrip/PhotoPriceStrip.vue'
import { useLightbox } from '@/shared/composables/use-lightbox'
import type { ICartGroup, ICartPhoto } from '../../../types/responses/cart.response'
import { useRemoveFromCart } from '@/shared/composables/use-remove-from-cart'

const props = defineProps<{
  group: ICartGroup
  unitPrice: number
  basePrice: number | null
  currency: string
  isLoading: boolean
}>()

const { mutate: removeFromCart } = useRemoveFromCart()

const {
  photos: lightboxPhotos,
  index: lightboxIndex,
  show: showLightbox,
  open: openLightbox,
} = useLightbox<ICartPhoto>()

const photoCount = computed(() => props.group.photos.length)
const eventDateLabel = computed(() => {
  if (!props.group.startDate || !props.group.endDate) return ''
  const start = formatDate(props.group.startDate)
  if (props.group.startDate.getTime() === props.group.endDate.getTime()) return start
  return `${start} – ${formatDate(props.group.endDate)}`
})
</script>

<template>
  <article class="checkout-summary-card">
    <header class="checkout-summary-card__header">
      <div>
        <h3 class="checkout-summary-card__event">{{ group.eventName }}</h3>
        <p v-if="eventDateLabel" class="checkout-summary-card__date">{{ eventDateLabel }}</p>
      </div>
      <span class="checkout-summary-card__count">
        {{ photoCount }} foto{{ photoCount === 1 ? '' : 's' }}
      </span>
    </header>

    <NDivider class="checkout-summary-card__divider" />

    <div class="checkout-summary-card__grid">
      <div
        v-for="(photo, index) in group.photos"
        :key="photo.id"
        class="checkout-summary-card__cell"
      >
        <div class="checkout-summary-card__thumb">
          <img
            :src="getGalleryUrl(photo.publicSlug)"
            :alt="`Foto ${photo.id}`"
            loading="lazy"
            @click="openLightbox(group.photos, index)"
          />
          <button
            class="checkout-summary-card__remove"
            aria-label="Quitar foto"
            @click.stop="removeFromCart(photo.id)"
          >
            <NIcon :component="CloseCircleOutline" :size="14" />
          </button>
        </div>
        <PhotoPriceStrip
          :unit-price="unitPrice"
          :base-price="basePrice"
          :currency="currency"
          :is-loading="isLoading"
        />
      </div>
    </div>

    <PhotoLightbox
      :photos="lightboxPhotos"
      :initial-index="lightboxIndex"
      :show="showLightbox"
      @update:show="showLightbox = $event"
    />
  </article>
</template>

<style scoped src="./checkout-summary.css" />
