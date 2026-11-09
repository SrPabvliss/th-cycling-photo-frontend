<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { AlertCircle } from '@vicons/ionicons5'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import type { IOrganizerContract } from '../../../types/responses/organizer-detail.response'
import {
  contractBarPercent,
  contractDaysToExpiry,
  contractLossLabel,
  contractState,
  contractStateLabel,
  perLabel,
} from './organizer-detail.utils'

defineProps<{
  contracts: IOrganizerContract[]
}>()
</script>

<template>
  <section class="od-sec">
    <h4>
      Contratos <span class="od-count">{{ contracts.length }}</span>
    </h4>
    <ul class="od-hists">
      <li
        v-for="contract in contracts"
        :key="contract.id"
        class="od-hist"
        :class="{
          'od-hist--loss': contractLossLabel(contract),
          'od-hist--live': contract.isValid,
        }"
      >
        <div class="od-hist__top">
          <b>{{ contract.eventsUsed }} de {{ contract.eventsTotal }} eventos</b>
          <span
            class="od-st"
            :class="{
              'od-st--live': contractState(contract) === 'vigente',
              'od-st--revoked': contractState(contract) === 'revocado',
              'od-st--expired': contractState(contract) === 'vencido',
            }"
            >{{ contractStateLabel(contract) }}</span
          >
        </div>
        <div class="od-hist__bar">
          <i
            :class="contract.isValid ? 'od-tone-bg--green' : 'od-tone-bg--grey'"
            :style="{ width: contractBarPercent(contract) + '%' }"
          />
        </div>
        <div v-if="contractLossLabel(contract)" class="od-loss">
          <NIcon :component="AlertCircle" :size="12" />{{ contractLossLabel(contract) }}
        </div>
        <dl class="od-dl od-dl--tight">
          <div>
            <dt>Fotos por evento</dt>
            <dd>{{ perLabel(contract.photosPerEvent) }}</dd>
          </div>
          <div>
            <dt>{{ contract.isValid ? 'Vence' : 'Venció' }}</dt>
            <dd>
              {{ formatDate(parseDateOnly(contract.validUntil)) }}
              <span v-if="contract.isValid" class="od-sub">
                · en {{ contractDaysToExpiry(contract) }} días</span
              >
            </dd>
          </div>
          <div>
            <dt>Aceptado</dt>
            <dd>
              {{ contract.acceptedAt ? formatDate(contract.acceptedAt) : '—' }}
              <span class="od-sub">· términos {{ contract.termsVersion }}</span>
            </dd>
          </div>
          <div>
            <dt>Emitido por</dt>
            <dd>
              {{ contract.issuedByName ?? '—' }}
              <span class="od-sub">· {{ formatDate(contract.issuedAt) }}</span>
            </dd>
          </div>
        </dl>
        <span v-if="contract.isBackfill" class="od-migr">Migrado</span>
      </li>
    </ul>
  </section>
</template>

<style scoped src="./organizer-detail-contracts.css" />
