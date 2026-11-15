<script setup lang="ts">
import { usePriceSheet } from '../../../composables/use-price-sheet'
import PriceSheet from '../PriceSheet/PriceSheet.vue'

// The one price sheet of the client area. The layout mounts it through the slot registry; anyone
// opens it with usePriceSheet().
const sheet = usePriceSheet()
</script>

<template>
  <PriceSheet :open="sheet.isOpen.value" :quantity="sheet.quantity.value" @close="sheet.close()" />
</template>
