<script setup lang="ts">
import { computed, toRef } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import { AlertCircleOutline, ChevronForwardOutline } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useChangeOrderContactPhone } from '../../../composables/mutations/use-change-order-contact-phone'
import type { IOrderDetail } from '../../../types/responses/order-detail.response'
import { getOrderIdentityDiffs, hasOrderPhoneDrifted } from '../../../utils/order-detail.utils'

const props = defineProps<{
  order: IOrderDetail
}>()

const identityDiffs = computed(() => getOrderIdentityDiffs(props.order))

// The buyer's account has another number than the order: one press brings the order up to date.
const { has } = usePermissions()
const message = useMessage()
const change = useChangeOrderContactPhone(toRef(() => props.order.id))
const canUseAccountPhone = computed(
  () => has(PERMISSIONS.ORDER_NOTIFY_PAYMENT) && hasOrderPhoneDrifted(props.order),
)

async function useAccountPhone() {
  const phoneNumber = props.order.customerPrimaryPhone
  if (!phoneNumber || change.isPending.value) return
  try {
    await change.mutateAsync({ phoneNumber, updateAccount: false })
    message.success('Teléfono del pedido actualizado.')
  } catch {
    message.error('No pudimos actualizar el teléfono. Intenta de nuevo.')
  }
}
</script>

<template>
  <div v-if="identityDiffs.length > 0" class="odp__ident">
    <b
      ><NIcon :component="AlertCircleOutline" :size="13" />Los datos cambiaron después del pedido</b
    >
    <div v-for="diff in identityDiffs" :key="diff.label" class="odp__ident-row">
      <span>{{ diff.label }}</span>
      <i>{{ diff.before }}</i>
      <NIcon :component="ChevronForwardOutline" :size="11" />
      <em>{{ diff.after }}</em>
    </div>
    <button
      v-if="canUseAccountPhone"
      type="button"
      class="odp__ident-action"
      data-test="use-account-phone"
      :disabled="change.isPending.value"
      @click="useAccountPhone"
    >
      Usar el teléfono de la cuenta en este pedido
    </button>
    <p>
      Izquierda: lo guardado al hacer el pedido. Derecha: la cuenta hoy. La lista agrupa por la
      cuenta.
    </p>
  </div>
</template>

<style scoped src="./order-detail-identity.css" />
