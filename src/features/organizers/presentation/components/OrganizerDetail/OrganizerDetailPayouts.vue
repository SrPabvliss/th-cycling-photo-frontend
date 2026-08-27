<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CardOutline, CashOutline } from '@vicons/ionicons5'

import type { IOrganizerPayout } from '../../../types/responses/organizer-detail.response'

defineProps<{
  payouts: IOrganizerPayout[]
}>()
</script>

<template>
  <section class="od-sec">
    <h4>
      Formas de pago <span class="od-count">{{ payouts.length }}</span>
    </h4>
    <div v-if="payouts.length === 0" class="od-empty">
      <span class="od-empty__title">Sin forma de pago registrada</span>
      <span class="od-empty__sub"
        >El organizador la configura desde su perfil. No se puede editar aquí.</span
      >
    </div>
    <ul v-else class="od-pays">
      <li v-for="payout in payouts" :key="payout.id">
        <span class="od-pay-ic" :class="{ 'od-pay-ic--pp': payout.provider === 'payphone' }">
          <NIcon
            :component="payout.provider === 'payphone' ? CardOutline : CashOutline"
            :size="15"
          />
        </span>
        <div v-if="payout.provider === 'payphone'">
          <b>Payphone</b>
          <span>{{ payout.receiverIdentifier ?? '—' }}</span>
        </div>
        <div v-else>
          <b>Transferencia bancaria</b>
          <span
            >{{ payout.bankName ?? '—' }} · {{ payout.accountType ?? '—' }}
            {{ payout.accountNumber ?? '' }}</span
          >
          <span class="od-sub"
            >{{ payout.accountHolder ?? '—' }} · {{ payout.holderIdentification ?? '—' }}</span
          >
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped src="./organizer-detail-payouts.css" />
