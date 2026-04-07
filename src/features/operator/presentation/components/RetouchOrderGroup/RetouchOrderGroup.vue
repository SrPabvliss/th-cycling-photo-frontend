<script setup lang="ts">
import { NCollapse, NCollapseItem } from 'naive-ui'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IRetouchQueueOrder } from '../../../types/responses/retouch-queue.response'
import RetouchPhotoItem from '../RetouchPhotoItem/RetouchPhotoItem.vue'

defineProps<{
  order: IRetouchQueueOrder
}>()

const emit = defineEmits<{
  uploaded: [photoId: string]
}>()
</script>

<template>
  <NCollapse :default-expanded-names="[order.orderId]">
    <NCollapseItem :name="order.orderId">
      <template #header>
        <div class="retouch-order__header">
          <span class="retouch-order__buyer">{{ order.buyerName }}</span>
          <span class="retouch-order__progress">
            {{ order.retouchedItems }}/{{ order.totalItems }} retocadas
          </span>
        </div>
      </template>
      <template #header-extra>
        <span class="retouch-order__time">{{ formatRelativeTime(order.createdAt) }}</span>
      </template>
      <div class="retouch-order__items">
        <RetouchPhotoItem
          v-for="item in order.items"
          :key="item.photoId"
          :item="item"
          @uploaded="emit('uploaded', $event)"
        />
      </div>
    </NCollapseItem>
  </NCollapse>
</template>

<style scoped src="./retouch-order-group.css" />
