<script setup lang="ts">
import { NSkeleton } from 'naive-ui'

import { useMyOrdersSummaryQuery } from '../../../composables/queries/use-my-orders-summary'

const { data, isPending, isError } = useMyOrdersSummaryQuery()
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
  </div>
</template>

<style scoped src="./orders-summary.css"></style>
