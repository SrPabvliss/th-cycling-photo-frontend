<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { AlertCircleOutline, ChevronForwardOutline } from '@vicons/ionicons5'

import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import { getOrderIdentityDiffs } from '../../../utils/order-detail.utils'

const props = defineProps<{
  order: IOrderDetail
}>()

const identityDiffs = computed(() => getOrderIdentityDiffs(props.order))
</script>

<template>
  <div v-if="identityDiffs.length > 0" class="odp__ident">
    <b
      ><NIcon :component="AlertCircleOutline" :size="13" />Los datos cambiaron después del
      pedido</b
    >
    <div v-for="diff in identityDiffs" :key="diff.label" class="odp__ident-row">
      <span>{{ diff.label }}</span>
      <i>{{ diff.before }}</i>
      <NIcon :component="ChevronForwardOutline" :size="11" />
      <em>{{ diff.after }}</em>
    </div>
    <p>
      Izquierda: lo guardado al hacer el pedido. Derecha: la cuenta hoy. La lista agrupa por la
      cuenta.
    </p>
  </div>
</template>
