<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'

import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import { isPlatformRole, type OrderOperatorRole } from '../../../utils/order-actions'
import { buildOrderDetailNotice } from '../../../utils/order-detail.utils'

const props = defineProps<{
  order: IOrderDetail
  role: OrderOperatorRole
}>()

const notice = computed(() =>
  buildOrderDetailNotice(props.order, isPlatformRole(props.role)),
)
</script>

<template>
  <div v-if="notice" :class="['odp__notice', `odp__notice--${notice.tone}`]">
    <NIcon :component="notice.icon" :size="17" />
    <div>
      <b>{{ notice.title }}</b>
      <span v-if="notice.body">{{ notice.body }}</span>
    </div>
  </div>
</template>
