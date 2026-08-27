<script setup lang="ts">
import { computed, type Component } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CheckmarkOutline,
  CloseOutline,
  GiftOutline,
  LogoWhatsapp,
  RefreshOutline,
  SendOutline,
} from '@vicons/ionicons5'

import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import {
  isPlatformRole,
  resolveOrderActions,
  type OrderActionId,
  type OrderOperatorRole,
} from '../../../utils/order-actions'

const props = defineProps<{
  order: IOrderDetail
  role: OrderOperatorRole
}>()

const emit = defineEmits<{
  action: [id: OrderActionId]
}>()

const ACTION_ICONS: Record<OrderActionId, Component> = {
  notify: LogoWhatsapp,
  resend: LogoWhatsapp,
  confirm: CheckmarkOutline,
  deliver: SendOutline,
  regenerate: RefreshOutline,
  gift: GiftOutline,
  to_sale: CheckmarkOutline,
  to_gift: GiftOutline,
  cancel: CloseOutline,
}

const actions = computed(() =>
  resolveOrderActions(
    { status: props.order.status, deliveredAt: props.order.deliveredAt },
    isPlatformRole(props.role),
  ),
)

function handleActionClick(id: OrderActionId) {
  emit('action', id)
}
</script>

<template>
  <div class="odp__actions">
    <span v-if="actions.length === 0" class="odp__no-actions"
      >Este pedido no admite más acciones.</span
    >
    <button
      v-for="action in actions"
      :key="action.id"
      :class="['odp__btn', `odp__btn--${action.kind}`]"
      @click="handleActionClick(action.id)"
    >
      <NIcon :component="ACTION_ICONS[action.id]" :size="13" />
      {{ action.label }}
    </button>
  </div>
</template>
