<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NEmpty, NFlex, NSpin, NTag } from 'naive-ui'

import { formatDate } from '@/shared/utils/date.utils'
import type {
  ContractStatus,
  IContractListItem,
} from '../../types/responses/contract-list.response'
import { useMyContracts } from '../../composables/queries/use-my-contracts'
import { pluralize } from '@/shared/utils/format.utils'

const { data: contracts, isLoading } = useMyContracts()

const STATUS_LABELS: Record<ContractStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  revoked: 'Revocado',
  expired: 'Vencido',
}

const STATUS_TAG_TYPE: Record<ContractStatus, 'warning' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  accepted: 'success',
  revoked: 'error',
  expired: 'default',
}

function eventsRemaining(contract: IContractListItem): number {
  return Math.max(contract.eventsTotal - contract.eventsUsed, 0)
}

function photosPerEventLabel(contract: IContractListItem): string {
  return contract.photosPerEvent == null ? 'Sin límite' : String(contract.photosPerEvent)
}

function isCurrentlyValid(contract: IContractListItem): boolean {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  return contract.validUntil >= startOfToday
}

const totalEventsRemaining = computed(() =>
  (contracts.value ?? [])
    .filter((contract) => contract.status === 'accepted' && isCurrentlyValid(contract))
    .reduce((sum, contract) => sum + eventsRemaining(contract), 0),
)
</script>

<template>
  <NCard title="Contratos" class="contracts-section">
    <NSpin v-if="isLoading" size="small" />

    <NEmpty v-else-if="!contracts?.length" description="No tienes contratos registrados" />

    <template v-else>
      <p class="contracts-section__summary">
        Puedes crear <strong>{{ totalEventsRemaining }}</strong>
        {{ pluralize(totalEventsRemaining, 'evento más', 'eventos más') }} en total con tus
        contratos vigentes.
      </p>

      <NFlex vertical :size="12">
        <div v-for="contract in contracts" :key="contract.id" class="contract-row">
          <div class="contract-row__header">
            <strong>{{ contract.commercialName }}</strong>
            <NTag :type="STATUS_TAG_TYPE[contract.status]" size="small">
              {{ STATUS_LABELS[contract.status] }}
            </NTag>
          </div>

          <div class="contract-row__details">
            <span>
              Aceptado: {{ contract.acceptedAt ? formatDate(contract.acceptedAt) : '—' }}
            </span>
            <span>
              Eventos: {{ contract.eventsUsed }} / {{ contract.eventsTotal }} ({{
                eventsRemaining(contract)
              }}
              disponibles)
            </span>
            <span>Fotos por evento: {{ photosPerEventLabel(contract) }}</span>
            <span>Vigente hasta: {{ formatDate(contract.validUntil) }}</span>
          </div>
        </div>
      </NFlex>
    </template>
  </NCard>
</template>

<style scoped src="./contracts-section.css"></style>
