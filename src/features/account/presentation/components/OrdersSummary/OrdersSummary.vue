<script setup lang="ts">
import { computed } from 'vue'
import { NSkeleton } from 'naive-ui'

import { formatCurrency } from '@/features/pricing/utils/format-currency'
import { useMyOrdersSummaryQuery } from '../../../composables/queries/use-my-orders-summary'

const { data, isPending, isError } = useMyOrdersSummaryQuery()

const spentLines = computed(() => {
  const spent = data.value?.spent ?? []
  if (spent.length === 0) return null
  return spent.map((entry) => formatCurrency(Number(entry.amount), entry.currency))
})
</script>

<template>
  <div v-if="!isError" class="orders-summary">
    <div class="orders-summary__tile">
      <template v-if="isPending">
        <NSkeleton text class="orders-summary__tile-skeleton" />
      </template>
      <template v-else>
        <span class="orders-summary__value">{{ data?.orderCount ?? 0 }}</span>
      </template>
      <span class="orders-summary__label">Compras</span>
    </div>

    <div class="orders-summary__tile">
      <template v-if="isPending">
        <NSkeleton text class="orders-summary__tile-skeleton" />
      </template>
      <template v-else>
        <span class="orders-summary__value">{{ data?.photoCount ?? 0 }}</span>
      </template>
      <span class="orders-summary__label">Fotos</span>
    </div>

    <div class="orders-summary__tile">
      <template v-if="isPending">
        <NSkeleton text class="orders-summary__tile-skeleton" />
      </template>
      <template v-else-if="spentLines">
        <span v-for="line in spentLines" :key="line" class="orders-summary__value">
          {{ line }}
        </span>
      </template>
      <template v-else>
        <span class="orders-summary__value">—</span>
      </template>
      <span class="orders-summary__label">Invertido</span>
    </div>

    <div class="orders-summary__tile">
      <template v-if="isPending">
        <NSkeleton text class="orders-summary__tile-skeleton" />
      </template>
      <template v-else>
        <span class="orders-summary__value">{{ data?.eventCount ?? 0 }}</span>
      </template>
      <span class="orders-summary__label">Eventos</span>
    </div>
  </div>
</template>

<style scoped src="./orders-summary.css"></style>
