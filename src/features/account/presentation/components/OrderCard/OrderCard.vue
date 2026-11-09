<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { ACCOUNT_ROUTE_NAMES } from '../../../routes'
import { ORDER_STATE_CONFIG } from '../../../constants/order-state-config'
import { getOrderAmountLabel } from '../../../utils/order-amount.utils'
import type { IMyOrderListItem } from '../../../types/responses/my-order.response'

const props = defineProps<{
  order: IMyOrderListItem
}>()

const stateConfig = computed(() => ORDER_STATE_CONFIG[props.order.state])

const createdAtLabel = computed(() => formatDate(new Date(props.order.createdAt)))

const amountLabel = computed(() => getOrderAmountLabel(props.order))

const coverPhotos = computed(() => props.order.previewPhotos.slice(0, 3))
const mainPhoto = computed(() => coverPhotos.value[0] ?? null)
const stackedPhotos = computed(() => coverPhotos.value.slice(1))

function handleImageError(event: Event): void {
  ;(event.target as HTMLImageElement).removeAttribute('src')
}
</script>

<template>
  <RouterLink
    :to="{ name: ACCOUNT_ROUTE_NAMES.ORDER_DETAIL, params: { id: order.id } }"
    class="order-card"
    :style="{ borderLeftColor: stateConfig.color }"
  >
    <div
      class="order-card__header"
      :style="{
        background: `${stateConfig.color}1f`,
        color: stateConfig.textColor,
      }"
    >
      <span class="order-card__header-left">
        <NIcon :component="stateConfig.icon" />
        <span class="order-card__header-label">{{ stateConfig.label }}</span>
      </span>
      <span class="order-card__header-date">{{ createdAtLabel }}</span>
    </div>

    <div class="order-card__cover">
      <div v-if="mainPhoto" class="order-card__cover-main">
        <img
          :src="mainPhoto.galleryUrl"
          alt=""
          class="order-card__cover-img"
          loading="lazy"
          @error="handleImageError"
        />
      </div>
      <div v-else class="order-card__cover-placeholder"></div>

      <div v-if="stackedPhotos.length > 0" class="order-card__cover-stack">
        <div
          v-for="photo in stackedPhotos"
          :key="photo.photoId"
          class="order-card__cover-stack-cell"
        >
          <img
            :src="photo.galleryUrl"
            alt=""
            class="order-card__cover-img"
            loading="lazy"
            @error="handleImageError"
          />
        </div>
      </div>
    </div>

    <div class="order-card__body">
      <p class="order-card__event">{{ order.eventName }}</p>
      <p class="order-card__photo-count">{{ order.photoCount }} fotos</p>
      <p v-if="amountLabel" class="order-card__amount">{{ amountLabel }}</p>
    </div>
  </RouterLink>
</template>

<style scoped src="./order-card.css"></style>
