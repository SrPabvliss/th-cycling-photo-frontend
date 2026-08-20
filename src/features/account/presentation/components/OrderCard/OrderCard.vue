<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { ACCOUNT_ROUTE_NAMES } from '../../../routes'
import { describeOrderState } from '../../../utils/order-state.utils'
import type { IMyOrderListItem } from '../../../types/responses/my-order.response'

const props = defineProps<{
  order: IMyOrderListItem
}>()

const stateChip = computed(() => describeOrderState(props.order.state))

const createdAtLabel = computed(() => formatDate(new Date(props.order.createdAt)))

const amountLabel = computed(() => {
  if (props.order.subtotal == null || props.order.currency == null) return null
  return `${props.order.currency} ${props.order.subtotal}`
})

const previewPhotos = computed(() => props.order.previewPhotos.slice(0, 3))
</script>

<template>
  <RouterLink
    :to="{ name: ACCOUNT_ROUTE_NAMES.ORDER_DETAIL, params: { id: order.id } }"
    class="order-card"
  >
    <div class="order-card__thumbs">
      <img
        v-for="photo in previewPhotos"
        :key="photo.photoId"
        :src="photo.galleryUrl"
        alt=""
        class="order-card__thumb"
      />
    </div>

    <div class="order-card__info">
      <div class="order-card__header">
        <span class="order-card__event">{{ order.eventName }}</span>
        <NTag v-if="stateChip" size="small" :type="stateChip.tone" :bordered="false">
          {{ stateChip.label }}
        </NTag>
      </div>

      <div class="order-card__meta">
        <span>{{ createdAtLabel }}</span>
        <span>{{ order.photoCount }} fotos</span>
        <span v-if="amountLabel">{{ amountLabel }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped src="./order-card.css"></style>
