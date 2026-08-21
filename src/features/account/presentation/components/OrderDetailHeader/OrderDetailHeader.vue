<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import { ORDER_STATE_CONFIG } from '../../../constants/order-state-config'
import { getOrderAmountLabel } from '../../../utils/order-amount.utils'
import type { IMyOrderDetail } from '../../../types/responses/my-order.response'

const props = defineProps<{
  order: IMyOrderDetail
}>()

const stateConfig = computed(() => ORDER_STATE_CONFIG[props.order.state])

const createdAtLabel = computed(() => formatDate(new Date(props.order.createdAt)))

const photoCountLabel = computed(() => `${props.order.photos.length} fotos`)

const amountLabel = computed(() => getOrderAmountLabel(props.order))
</script>

<template>
  <div class="odh">
    <div class="odh__hero">
      <div class="odh__icon" :style="{ background: stateConfig.color }">
        <NIcon :component="stateConfig.icon" :size="40" color="#fff" />
      </div>
    </div>

    <h1 class="odh__title">{{ order.eventName }}</h1>

    <span
      class="odh__chip"
      :style="{ background: `${stateConfig.color}1f`, color: stateConfig.textColor }"
    >
      <NIcon :component="stateConfig.icon" />
      {{ stateConfig.label }}
    </span>

    <div class="odh__stats">
      <span>{{ createdAtLabel }}</span>
      <span class="odh__dot" />
      <span>{{ photoCountLabel }}</span>
      <template v-if="amountLabel">
        <span class="odh__dot" />
        <span>{{ amountLabel }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped src="./order-detail-header.css"></style>
