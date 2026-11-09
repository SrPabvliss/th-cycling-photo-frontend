<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { BanOutline, MailOutline, TimeOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import type { ContractBlockReason } from '@/features/tenant-profile/utils/contract-validity.utils'

const props = defineProps<{
  reason: ContractBlockReason
  eventsTotal: number | null
  expiredOn: Date | null
}>()

const isExpiry = computed(() => props.reason === 'expired')

const TITLES: Record<ContractBlockReason, string> = {
  none: '',
  exhausted: 'Sin cupo de eventos.',
  expired: 'Sin contrato vigente.',
  pending: 'Tienes un contrato sin aceptar.',
  missing: 'Todavía no tienes contrato.',
}

const title = computed(() => TITLES[props.reason])

const noteIcon = computed(() => {
  if (props.reason === 'pending') return MailOutline
  return isExpiry.value ? TimeOutline : BanOutline
})

const hint = computed(() => {
  if (props.reason === 'exhausted') {
    return props.eventsTotal != null
      ? `Tu contrato vigente ya consumió sus ${props.eventsTotal} eventos: no puedes crear otro hasta renovarlo. Escríbenos para emitir un contrato nuevo.`
      : 'Tu contrato vigente ya consumió su cupo de eventos: no puedes crear otro hasta renovarlo. Escríbenos para emitir un contrato nuevo.'
  }

  if (props.reason === 'expired') {
    return props.expiredOn != null
      ? `Tu contrato venció el ${formatDate(props.expiredOn)}: no puedes crear eventos hasta renovarlo. Escríbenos para emitir uno nuevo.`
      : 'Tu contrato venció: no puedes crear eventos hasta renovarlo. Escríbenos para emitir uno nuevo.'
  }

  if (props.reason === 'pending') {
    return 'Te enviamos un contrato por correo y todavía no lo aceptas: ábrelo desde ese enlace y podrás crear eventos.'
  }

  return 'Todavía no tienes un contrato, así que no puedes crear eventos. Escríbenos para emitir uno.'
})
</script>

<template>
  <div class="ees-headsup ees-headsup--red" data-test="no-quota-note">
    <NIcon :component="noteIcon" :size="15" />
    <span
      ><b>{{ title }}</b> {{ hint }}</span
    >
  </div>
</template>

<style scoped src="./event-empty-states.css" />
